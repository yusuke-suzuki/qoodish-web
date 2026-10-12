import type { WebPushPreferences } from '@qoodish/api-contract';
import { and, eq, notExists, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  devicesQuery,
  effectiveWebPush,
  latestPreferencesQuery,
  removeDevices
} from './accounts.ts';
import {
  forgetServiceAccountToken,
  type ServiceAccount,
  serviceAccountToken
} from './auth/service-account.ts';
import {
  chunks,
  type Database,
  database,
  inIds,
  uniqueIds
} from './db/client.ts';
import { comments, images, mutes, notifications, users } from './db/schema.ts';
import type { Env } from './env.ts';
import { variantUrl } from './images.ts';
import { activeMute } from './mutes.ts';
import { clickAction } from './notifications.ts';
import { noBlockBetween } from './visibility.ts';

export type WebPushMessage = {
  notificationId: number;
  deviceIds?: number[];
};

type Outcome = 'sent' | 'stale' | 'retry' | 'dropped';

const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const FCM_TIMEOUT_MS = 10_000;
const FCM_CONCURRENCY = 6;
const REDELIVERY_DELAY_SECONDS = 60;

const fcmError = z.object({
  error: z.object({
    details: z
      .array(
        z.object({
          errorCode: z.string().optional(),
          fieldViolations: z
            .array(z.object({ field: z.string().optional() }))
            .optional()
        })
      )
      .optional()
  })
});

export async function enqueueWebPush(
  queue: Queue<WebPushMessage>,
  recorded: readonly { id: number }[]
): Promise<void> {
  if (recorded.length === 0) {
    return;
  }

  try {
    await queue.sendBatch(
      recorded.map(({ id }) => ({ body: { notificationId: id } }))
    );
  } catch (error) {
    console.error('Failed to enqueue web push', error);
  }
}

type PushedNotification = {
  id: number;
  key: string;
  notifiableType: string;
  notifiableId: number;
  notifierId: number;
  recipientId: number;
  notifierName: string | null;
  notifierImageUrl: string | null;
  commentableType: string | null;
  commentableId: number | null;
};

function linkedOf(row: PushedNotification) {
  if (row.notifiableType !== 'Comment') {
    return { type: row.notifiableType, id: row.notifiableId };
  }

  return row.commentableType === null || row.commentableId === null
    ? null
    : { type: row.commentableType, id: row.commentableId };
}

function pushData(
  row: PushedNotification,
  webEndpoint: string
): Record<string, string> {
  return {
    icon:
      row.notifierImageUrl === null
        ? ''
        : variantUrl(row.notifierImageUrl, 'avatar'),
    click_action: `${webEndpoint}${clickAction(
      row.key,
      { type: row.notifiableType, id: row.notifiableId },
      linkedOf(row)
    )}`,
    notification_id: String(row.id),
    key: row.key,
    notifier_id: String(row.notifierId),
    notifier_name: row.notifierName ?? '',
    notifiable_id: String(row.notifiableId),
    notifiable_type: row.notifiableType.toLowerCase()
  };
}

async function pushedNotifications(
  db: Database,
  notificationIds: readonly number[]
): Promise<PushedNotification[]> {
  const rows = await db
    .select({
      id: notifications.id,
      key: notifications.key,
      notifiableType: notifications.notifiableType,
      notifiableId: notifications.notifiableId,
      notifierId: sql<number>`${users.id}`.as('notifier_user_id'),
      recipientId: notifications.recipientId,
      notifierName: users.name,
      notifierImageUrl: images.url,
      commentableType: comments.commentableType,
      commentableId: comments.commentableId
    })
    .from(notifications)
    .innerJoin(users, eq(users.id, notifications.notifierId))
    .leftJoin(images, eq(images.id, users.imageId))
    .leftJoin(
      comments,
      and(
        eq(notifications.notifiableType, 'Comment'),
        eq(comments.id, notifications.notifiableId)
      )
    )
    .where(
      and(
        inIds(notifications.id, notificationIds),
        eq(notifications.notifierType, 'User'),
        eq(notifications.recipientType, 'User'),
        noBlockBetween(db, notifications.recipientId, notifications.notifierId),
        notExists(
          db
            .select({ id: mutes.id })
            .from(mutes)
            .where(
              and(
                eq(mutes.muterId, notifications.recipientId),
                eq(mutes.mutedId, notifications.notifierId),
                activeMute(db)
              )
            )
        )
      )
    );

  return rows.flatMap(
    ({ key, notifiableType, notifiableId, recipientId, ...row }) =>
      key === null ||
      notifiableType === null ||
      notifiableId === null ||
      recipientId === null
        ? []
        : [{ ...row, key, notifiableType, notifiableId, recipientId }]
  );
}

async function errorDetails(response: Response): Promise<string[]> {
  const parsed = fcmError.safeParse(await response.json().catch(() => null));

  return parsed.success
    ? (parsed.data.error.details ?? []).flatMap((detail) => [
        ...(detail.errorCode === undefined ? [] : [detail.errorCode]),
        ...(detail.fieldViolations ?? []).flatMap((violation) =>
          violation.field === undefined ? [] : [violation.field]
        )
      ])
    : [];
}

async function outcomeOf(response: Response): Promise<Outcome> {
  if (response.ok) {
    return 'sent';
  }

  if (response.status === 404) {
    return 'stale';
  }

  if (response.status === 400 || response.status === 403) {
    const details = await errorDetails(response);

    if (
      details.includes('SENDER_ID_MISMATCH') ||
      (response.status === 400 && details.includes('message.token'))
    ) {
      return 'stale';
    }
  }

  if ([401, 429].includes(response.status) || response.status >= 500) {
    return 'retry';
  }

  console.error(`FCM rejected a web push with ${response.status}`);
  return 'dropped';
}

async function postToFcm(
  env: Env,
  accessToken: string,
  message: { token: string; data: Record<string, string> }
): Promise<Outcome> {
  let response: Response;

  try {
    response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${env.GOOGLE_PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ message }),
        signal: AbortSignal.timeout(FCM_TIMEOUT_MS)
      }
    );
  } catch (error) {
    console.warn(`FCM request failed: ${String(error)}`);
    return 'retry';
  }

  if (response.status === 401) {
    forgetServiceAccountToken(serviceAccountOf(env), FCM_SCOPE);
  }

  return outcomeOf(response);
}

function serviceAccountOf(env: Env): ServiceAccount {
  return {
    clientEmail: env.GOOGLE_CLIENT_EMAIL,
    privateKey: env.GOOGLE_PRIVATE_KEY
  };
}

export async function deliverWebPush(
  batch: MessageBatch<WebPushMessage>,
  env: Env
): Promise<void> {
  const db = database(env.DB);
  const rows = await pushedNotifications(
    db,
    uniqueIds(batch.messages.map((message) => message.body.notificationId))
  );

  if (rows.length === 0) {
    batch.ackAll();
    return;
  }

  const recipientIds = uniqueIds(rows.map((row) => row.recipientId));
  const [recipientDevices, preferences] = await db.batch([
    devicesQuery(db, recipientIds),
    latestPreferencesQuery(db, recipientIds)
  ]);
  const storedWebPush = new Map(
    preferences.map((preference) => [preference.userId, preference.webPush])
  );
  const devicesOf = Map.groupBy(recipientDevices, (device) => device.userId);
  const allowedRows = new Map(
    rows
      .filter(
        (row) =>
          effectiveWebPush(storedWebPush.get(row.recipientId))[
            row.key as keyof WebPushPreferences
          ] === true
      )
      .map((row) => [row.id, row])
  );
  const deliveries = batch.messages.flatMap((message) => {
    const row = allowedRows.get(message.body.notificationId);
    const targeted = message.body.deviceIds && new Set(message.body.deviceIds);

    return row === undefined
      ? []
      : (devicesOf.get(row.recipientId) ?? [])
          .filter((device) => !targeted || targeted.has(device.id))
          .map((device) => ({ message, row, device }));
  });

  if (deliveries.length === 0) {
    batch.ackAll();
    return;
  }

  let accessToken: string;

  try {
    accessToken = await serviceAccountToken(serviceAccountOf(env), FCM_SCOPE);
  } catch (error) {
    console.error('Failed to get an FCM access token', error);
    batch.retryAll({ delaySeconds: REDELIVERY_DELAY_SECONDS });
    return;
  }

  const outcomes = [];

  for (const group of chunks(deliveries, FCM_CONCURRENCY)) {
    outcomes.push(
      ...(await Promise.all(
        group.map(async ({ message, row, device }) => ({
          message,
          deviceId: device.id,
          outcome: await postToFcm(env, accessToken, {
            token: device.registrationToken,
            data: pushData(row, env.WEB_ENDPOINT)
          })
        }))
      ))
    );
  }

  try {
    await removeDevices(
      db,
      uniqueIds(
        outcomes
          .filter(({ outcome }) => outcome === 'stale')
          .map(({ deviceId }) => deviceId)
      )
    );
  } catch (error) {
    console.error('Failed to remove stale devices', error);
  }

  const outcomesOf = Map.groupBy(outcomes, ({ message }) => message);
  const retried: Message<WebPushMessage>[] = [];
  const redelivered: Message<WebPushMessage>[] = [];
  const redeliveries: MessageSendRequest<WebPushMessage>[] = [];

  for (const message of batch.messages) {
    const attempted = outcomesOf.get(message) ?? [];
    const failed = attempted.filter(({ outcome }) => outcome === 'retry');

    if (failed.length > 0 && failed.length === attempted.length) {
      retried.push(message);
    } else if (failed.length > 0) {
      redelivered.push(message);
      redeliveries.push({
        body: {
          notificationId: message.body.notificationId,
          deviceIds: failed.map(({ deviceId }) => deviceId)
        },
        delaySeconds: REDELIVERY_DELAY_SECONDS
      });
    }
  }

  if (redeliveries.length > 0) {
    try {
      await env.WEB_PUSH_QUEUE.sendBatch(redeliveries);
    } catch (error) {
      console.error('Failed to redeliver web push', error);
      retried.push(...redelivered);
    }
  }

  for (const message of batch.messages) {
    if (retried.includes(message)) {
      message.retry({ delaySeconds: REDELIVERY_DELAY_SECONDS });
    } else {
      message.ack();
    }
  }
}

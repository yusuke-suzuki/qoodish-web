import {
  createExecutionContext,
  createMessageBatch,
  env,
  getQueueResult
} from 'cloudflare:test';
import { asc, eq } from 'drizzle-orm';
import { exportPKCS8, generateKeyPair, jwtVerify } from 'jose';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DEVELOPMENT } from '../environments.ts';
import { GOOGLE_TOKEN_URL } from './auth/service-account.ts';
import { database } from './db/client.ts';
import {
  blocks,
  devices,
  mutes,
  notifications,
  userPreferences,
  users
} from './db/schema.ts';
import worker from './index.ts';
import { at, IMAGE_BASE, ids, seedWorld } from './test/world.ts';
import type { WebPushMessage } from './web-push.ts';

const FCM_URL = `https://fcm.googleapis.com/v1/projects/${env.GOOGLE_PROJECT_ID}/messages:send`;
const ACCESS_TOKEN = 'fcm-access-token';
const dave = 4;
const erin = 5;
const stamp = { createdAt: at(28), updatedAt: at(28) };

const db = () => database(env.DB);

const device = (userId: number, registrationToken: string) => ({
  userId,
  registrationToken,
  ...stamp
});

async function serviceAccount() {
  const { privateKey, publicKey } = await generateKeyPair('RS256', {
    extractable: true
  });

  return {
    publicKey,
    pem: await exportPKCS8(privateKey)
  };
}

let account: Awaited<ReturnType<typeof serviceAccount>>;

const notificationIds: Record<string, number> = {};

async function recordNotification(
  name: string,
  row: {
    key: string;
    notifiableType: string;
    notifiableId: number;
    notifierId: number;
    recipientId: number;
  }
) {
  const [inserted] = await db()
    .insert(notifications)
    .values({
      ...row,
      notifierType: 'User',
      recipientType: 'User',
      read: false,
      ...stamp
    })
    .returning({ id: notifications.id });

  notificationIds[name] = inserted?.id ?? 0;
}

beforeAll(async () => {
  await seedWorld(env.DB);
  account = await serviceAccount();
  await db()
    .insert(users)
    .values([
      { id: dave, uid: 'dave', name: 'Dave', ...stamp },
      { id: erin, uid: 'erin', name: 'Erin', ...stamp }
    ]);
  await db()
    .insert(devices)
    .values([
      device(ids.alice, 'alice-device'),
      device(ids.bob, 'bob-phone'),
      device(ids.bob, 'bob-laptop'),
      device(ids.carol, 'carol-device'),
      device(dave, 'dave-gone'),
      device(dave, 'dave-invalid'),
      device(dave, 'dave-ok'),
      device(erin, 'erin-unavailable')
    ]);
  await db()
    .insert(userPreferences)
    .values({ userId: ids.carol, webPush: '{"liked":false}', ...stamp });
  await db()
    .insert(blocks)
    .values({ blockerId: ids.alice, blockedId: ids.carol, createdAt: at(28) });
  await db()
    .insert(mutes)
    .values({ muterId: ids.carol, mutedId: ids.bob, createdAt: at(28) });

  await recordNotification('likedComment', {
    key: 'liked',
    notifiableType: 'Comment',
    notifiableId: ids.pinComment,
    notifierId: ids.alice,
    recipientId: ids.bob
  });
  await recordNotification('comment', {
    key: 'comment',
    notifiableType: 'Chapter',
    notifiableId: ids.noodleStory,
    notifierId: ids.bob,
    recipientId: ids.alice
  });
  await recordNotification('invited', {
    key: 'coauthor_invited',
    notifiableType: 'Map',
    notifiableId: ids.ramen,
    notifierId: dave,
    recipientId: ids.alice
  });
  await recordNotification('likedOff', {
    key: 'liked',
    notifiableType: 'Pin',
    notifiableId: ids.shoyu,
    notifierId: dave,
    recipientId: ids.carol
  });
  await recordNotification('blockedByRecipient', {
    key: 'comment',
    notifiableType: 'Pin',
    notifiableId: ids.shoyu,
    notifierId: ids.carol,
    recipientId: ids.alice
  });
  await recordNotification('blockedByNotifier', {
    key: 'comment',
    notifiableType: 'Pin',
    notifiableId: ids.shoyu,
    notifierId: ids.alice,
    recipientId: ids.carol
  });
  await recordNotification('muted', {
    key: 'comment',
    notifiableType: 'Pin',
    notifiableId: ids.shoyu,
    notifierId: ids.bob,
    recipientId: ids.carol
  });
  await recordNotification('toDave', {
    key: 'liked',
    notifiableType: 'Pin',
    notifiableId: ids.shoyu,
    notifierId: ids.alice,
    recipientId: dave
  });
  await recordNotification('toErin', {
    key: 'liked',
    notifiableType: 'Pin',
    notifiableId: ids.shoyu,
    notifierId: ids.alice,
    recipientId: erin
  });
});

type Sent = { token: string; data: Record<string, string> };

const invalidToken = Response.json(
  {
    error: {
      code: 400,
      status: 'INVALID_ARGUMENT',
      details: [
        {
          '@type': 'type.googleapis.com/google.rpc.BadRequest',
          fieldViolations: [{ field: 'message.token' }]
        }
      ]
    }
  },
  { status: 400 }
);

function mockGoogle(
  statusOf: (token: string) => number | Response | Error = () => 200
) {
  const sent: Sent[] = [];
  const tokenRequests: FormData[] = [];
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url === GOOGLE_TOKEN_URL) {
        tokenRequests.push(await request.formData());
        return Response.json({ access_token: ACCESS_TOKEN, expires_in: 3599 });
      }

      expect(request.url).toBe(FCM_URL);
      expect(request.headers.get('authorization')).toBe(
        `Bearer ${ACCESS_TOKEN}`
      );

      const { message } = (await request.json()) as { message: Sent };
      const status = statusOf(message.token);

      if (status instanceof Error) {
        throw status;
      }

      sent.push(message);
      return status instanceof Response
        ? status.clone()
        : Response.json({}, { status });
    });

  return { fetch, sent, tokenRequests };
}

async function deliver(
  names: string[],
  {
    privateKey = account.pem,
    deviceIds
  }: { privateKey?: string; deviceIds?: number[] } = {}
) {
  const batch = createMessageBatch<WebPushMessage>(
    DEVELOPMENT.webPushQueue,
    names.map((name) => ({
      id: name,
      timestamp: new Date(),
      attempts: 1,
      body: { notificationId: notificationIds[name] ?? 0, deviceIds }
    }))
  );
  const ctx = createExecutionContext();
  const redelivered = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

  await worker.queue(batch, {
    ...env,
    GOOGLE_PRIVATE_KEY: privateKey
  });

  return { ...(await getQueueResult(batch, ctx)), redelivered };
}

async function deviceIdsOf(userId: number, tokens: string[]) {
  const rows = await db()
    .select({ id: devices.id, token: devices.registrationToken })
    .from(devices)
    .where(eq(devices.userId, userId));

  return rows.filter((row) => tokens.includes(row.token)).map((row) => row.id);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('deliverWebPush', () => {
  it('sends the notification data to every device of the recipient', async () => {
    const { sent } = mockGoogle();
    const result = await deliver(['likedComment', 'comment', 'invited']);
    const likedComment = {
      icon: `${IMAGE_BASE}/alice/avatar`,
      click_action: `${env.WEB_ENDPOINT}/pins/${ids.shoyu}`,
      notification_id: String(notificationIds.likedComment),
      key: 'liked',
      notifier_id: String(ids.alice),
      notifier_name: 'Alice',
      notifiable_id: String(ids.pinComment),
      notifiable_type: 'comment'
    };

    expect(sent).toHaveLength(4);
    expect(sent).toEqual(
      expect.arrayContaining([
        { token: 'bob-phone', data: likedComment },
        { token: 'bob-laptop', data: likedComment },
        {
          token: 'alice-device',
          data: {
            icon: '',
            click_action: `${env.WEB_ENDPOINT}/chapters/${ids.noodleStory}`,
            notification_id: String(notificationIds.comment),
            key: 'comment',
            notifier_id: String(ids.bob),
            notifier_name: 'Bob',
            notifiable_id: String(ids.noodleStory),
            notifiable_type: 'chapter'
          }
        },
        {
          token: 'alice-device',
          data: {
            icon: '',
            click_action: `${env.WEB_ENDPOINT}/coauthorship_invitations`,
            notification_id: String(notificationIds.invited),
            key: 'coauthor_invited',
            notifier_id: String(dave),
            notifier_name: 'Dave',
            notifiable_id: String(ids.ramen),
            notifiable_type: 'map'
          }
        }
      ])
    );
    expect(result.explicitAcks.sort()).toEqual([
      'comment',
      'invited',
      'likedComment'
    ]);
    expect(result.retryMessages).toEqual([]);
  });

  it.each([
    ['the recipient turned the key off', 'likedOff'],
    ['the recipient blocks the notifier', 'blockedByRecipient'],
    ['the notifier blocks the recipient', 'blockedByNotifier'],
    ['the recipient mutes the notifier', 'muted'],
    ['the notification does not exist', 'missing']
  ])('sends nothing and acknowledges when %s', async (_, name) => {
    const { fetch } = mockGoogle();
    const result = await deliver([name]);

    expect(fetch).not.toHaveBeenCalled();
    expect(result.explicitAcks.length + Number(result.ackAll)).toBe(1);
    expect(result.retryMessages).toEqual([]);
  });

  it('keeps the device and drops the push when FCM rejects the message itself', async () => {
    mockGoogle((token) => (token === 'alice-device' ? 400 : 200));
    const result = await deliver(['comment']);

    expect(result.explicitAcks).toEqual(['comment']);
    expect(result.retryMessages).toEqual([]);
    expect(
      await db()
        .select({ token: devices.registrationToken })
        .from(devices)
        .where(eq(devices.userId, ids.alice))
    ).toEqual([{ token: 'alice-device' }]);
  });

  it('removes a device registered under another sender', async () => {
    mockGoogle((token) =>
      token === 'erin-unavailable'
        ? Response.json(
            {
              error: {
                code: 403,
                details: [
                  {
                    '@type':
                      'type.googleapis.com/google.firebase.fcm.v1.FcmError',
                    errorCode: 'SENDER_ID_MISMATCH'
                  }
                ]
              }
            },
            { status: 403 }
          )
        : 200
    );
    const result = await deliver(['toErin']);

    expect(result.explicitAcks).toEqual(['toErin']);
    expect(
      await db().select().from(devices).where(eq(devices.userId, erin))
    ).toEqual([]);
    await db().insert(devices).values(device(erin, 'erin-unavailable'));
  });

  it('retries the whole batch later when no access token can be had', async () => {
    const result = await deliver(['comment'], { privateKey: 'not a key' });

    expect(result.retryBatch.retry).toBe(true);
    expect(result.explicitAcks).toEqual([]);
  });

  it('signs in again and retries when FCM refuses the access token', async () => {
    const fresh = await serviceAccount();
    let refused = false;
    const { tokenRequests } = mockGoogle(() => {
      if (refused) {
        return 200;
      }

      refused = true;
      return 401;
    });

    const first = await deliver(['comment'], { privateKey: fresh.pem });
    await deliver(['comment'], { privateKey: fresh.pem });

    expect(first.retryMessages).toEqual([{ msgId: 'comment' }]);
    expect(tokenRequests).toHaveLength(2);
  });

  it('removes the devices FCM reports as unregistered or invalid', async () => {
    const { sent } = mockGoogle(
      (token) =>
        ({ 'dave-gone': 404, 'dave-invalid': invalidToken })[token] ?? 200
    );
    const result = await deliver(['toDave']);

    expect(sent.map(({ token }) => token).sort()).toEqual([
      'dave-gone',
      'dave-invalid',
      'dave-ok'
    ]);
    expect(
      await db()
        .select({ token: devices.registrationToken })
        .from(devices)
        .where(eq(devices.userId, dave))
        .orderBy(asc(devices.id))
    ).toEqual([{ token: 'dave-ok' }]);
    expect(result.explicitAcks).toEqual(['toDave']);
  });

  it.each([
    ['FCM is unavailable', 503],
    ['FCM throttles', 429],
    ['the request fails', new TypeError('Network connection lost')]
  ])(
    'retries only the message whose push failed when %s',
    async (_, failure) => {
      mockGoogle((token) => (token === 'erin-unavailable' ? failure : 200));
      const result = await deliver(['toErin', 'likedComment']);

      expect(result.retryMessages).toEqual([{ msgId: 'toErin' }]);
      expect(result.explicitAcks).toEqual(['likedComment']);
      expect(result.redelivered).not.toHaveBeenCalled();
      expect(
        await db()
          .select({ token: devices.registrationToken })
          .from(devices)
          .where(eq(devices.userId, erin))
      ).toEqual([{ token: 'erin-unavailable' }]);
    }
  );

  it('redelivers only to the devices whose push failed', async () => {
    const { sent } = mockGoogle((token) =>
      token === 'bob-laptop' ? 503 : 200
    );
    const result = await deliver(['likedComment']);

    expect(sent.map(({ token }) => token).sort()).toEqual([
      'bob-laptop',
      'bob-phone'
    ]);
    expect(result.explicitAcks).toEqual(['likedComment']);
    expect(result.retryMessages).toEqual([]);
    expect(result.redelivered).toHaveBeenCalledWith([
      {
        body: {
          notificationId: notificationIds.likedComment,
          deviceIds: await deviceIdsOf(ids.bob, ['bob-laptop'])
        },
        delaySeconds: 60
      }
    ]);
  });

  it('sends a redelivery only to the devices it names', async () => {
    const { sent } = mockGoogle();
    const result = await deliver(['likedComment'], {
      deviceIds: await deviceIdsOf(ids.bob, ['bob-laptop'])
    });

    expect(sent.map(({ token }) => token)).toEqual(['bob-laptop']);
    expect(result.explicitAcks).toEqual(['likedComment']);
  });

  it('signs in as the service account once and reuses the access token', async () => {
    const fresh = await serviceAccount();
    const { tokenRequests } = mockGoogle();

    await deliver(['likedComment'], { privateKey: fresh.pem });
    await deliver(['comment'], { privateKey: fresh.pem });

    expect(tokenRequests).toHaveLength(1);
    expect(tokenRequests[0]?.get('grant_type')).toBe(
      'urn:ietf:params:oauth:grant-type:jwt-bearer'
    );

    const { payload } = await jwtVerify(
      String(tokenRequests[0]?.get('assertion')),
      fresh.publicKey,
      {
        issuer: env.GOOGLE_CLIENT_EMAIL,
        audience: GOOGLE_TOKEN_URL
      }
    );

    expect(payload.scope).toBe(
      'https://www.googleapis.com/auth/firebase.messaging'
    );
  });

  it('accepts a private key whose newlines are stored escaped', async () => {
    const fresh = await serviceAccount();
    const { sent } = mockGoogle();

    await deliver(['comment'], {
      privateKey: fresh.pem.replaceAll('\n', '\\n')
    });

    expect(sent.map(({ token }) => token)).toEqual(['alice-device']);
  });
});

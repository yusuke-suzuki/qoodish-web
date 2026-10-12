import type {
  ApiCursorPage,
  ModeratedAccount,
  Profile,
  WebPushPreferences
} from '@qoodish/api-contract';
import {
  and,
  desc,
  eq,
  inArray,
  lt,
  max,
  notExists,
  type SQL
} from 'drizzle-orm';
import { z } from 'zod';
import { currentTimestamp, type Database, inIds } from './db/client.ts';
import {
  blocks,
  devices,
  images,
  mutes,
  unblocks,
  unmutes,
  userPreferences,
  users
} from './db/schema.ts';
import {
  chapterAuthor,
  profileAttributes,
  profileQuery,
  userColumns
} from './users.ts';

const ACCOUNTS_PER_PAGE = 50;

const WEB_PUSH_DEFAULTS: WebPushPreferences = {
  coauthor_invited: true,
  liked: true,
  comment: true,
  published: true
};

export function effectiveWebPush(
  stored: string | undefined
): WebPushPreferences {
  const choices = stored
    ? (JSON.parse(stored) as Partial<WebPushPreferences>)
    : {};

  return Object.fromEntries(
    Object.entries(WEB_PUSH_DEFAULTS).map(([key, fallback]) => [
      key,
      choices[key as keyof WebPushPreferences] ?? fallback
    ])
  ) as WebPushPreferences;
}

function latestPreferenceQuery(db: Database, userId: number) {
  return db
    .select({ webPush: userPreferences.webPush })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .orderBy(desc(userPreferences.id))
    .limit(1);
}

export function latestPreferencesQuery(
  db: Database,
  userIds: readonly number[]
) {
  return db
    .select({
      userId: userPreferences.userId,
      webPush: userPreferences.webPush
    })
    .from(userPreferences)
    .where(
      inArray(
        userPreferences.id,
        db
          .select({ id: max(userPreferences.id).as('id') })
          .from(userPreferences)
          .where(inIds(userPreferences.userId, userIds))
          .groupBy(userPreferences.userId)
      )
    );
}

export async function profile(db: Database, userId: number): Promise<Profile> {
  const [[user], [preference]] = await db.batch([
    profileQuery(db, userId),
    latestPreferenceQuery(db, userId)
  ]);
  return {
    ...profileAttributes(user),
    push_notification: effectiveWebPush(preference?.webPush)
  };
}

const webPushChoice = z.boolean({ error: 'web_push_invalid' }).optional();

export const preferencesInput = z.object({
  web_push: z
    .record(z.string(), z.unknown())
    .refine((changes) => Object.keys(changes).length > 0)
    .pipe(
      z.object({
        coauthor_invited: webPushChoice,
        liked: webPushChoice,
        comment: webPushChoice,
        published: webPushChoice
      })
    )
});

export async function updateWebPush(
  db: Database,
  userId: number,
  changes: Partial<WebPushPreferences>
): Promise<WebPushPreferences> {
  const [preference] = await latestPreferenceQuery(db, userId);
  const current = effectiveWebPush(preference?.webPush);
  const snapshot: WebPushPreferences = { ...current, ...changes };

  if (
    preference &&
    (Object.keys(current) as (keyof WebPushPreferences)[]).every(
      (key) => snapshot[key] === current[key]
    )
  ) {
    return current;
  }

  const now = currentTimestamp();

  await db.insert(userPreferences).values({
    userId,
    webPush: JSON.stringify(snapshot),
    createdAt: now,
    updatedAt: now
  });

  return snapshot;
}

export async function registerDevice(
  db: Database,
  userId: number,
  registrationToken: string
): Promise<void> {
  const now = currentTimestamp();

  await db
    .insert(devices)
    .values({ userId, registrationToken, createdAt: now, updatedAt: now })
    .onConflictDoNothing({
      target: [devices.userId, devices.registrationToken]
    });
}

export async function unregisterDevice(
  db: Database,
  userId: number,
  registrationToken: string
): Promise<void> {
  await db
    .delete(devices)
    .where(
      and(
        eq(devices.userId, userId),
        eq(devices.registrationToken, registrationToken)
      )
    );
}

export function devicesQuery(db: Database, userIds: readonly number[]) {
  return db
    .select({
      id: devices.id,
      userId: devices.userId,
      registrationToken: devices.registrationToken
    })
    .from(devices)
    .where(inIds(devices.userId, userIds));
}

export async function removeDevices(
  db: Database,
  deviceIds: readonly number[]
): Promise<void> {
  if (deviceIds.length === 0) {
    return;
  }

  await db.delete(devices).where(inIds(devices.id, deviceIds));
}

async function accountsPage(
  db: Database,
  query: {
    accountId: typeof blocks.blockedId | typeof mutes.mutedId;
    recordId: typeof blocks.id | typeof mutes.id;
    table: typeof blocks | typeof mutes;
    condition: SQL | undefined;
  },
  cursor: number | null
): Promise<ApiCursorPage<ModeratedAccount>> {
  const rows = await db
    .select({ ...userColumns, latestId: max(query.recordId).as('latest_id') })
    .from(query.table)
    .innerJoin(users, eq(users.id, query.accountId))
    .leftJoin(images, eq(images.id, users.imageId))
    .where(query.condition)
    .groupBy(query.accountId)
    .having(cursor === null ? undefined : lt(max(query.recordId), cursor))
    .orderBy(desc(max(query.recordId)))
    .limit(ACCOUNTS_PER_PAGE);

  return {
    data: rows.map(chapterAuthor),
    next_cursor:
      rows.length === ACCOUNTS_PER_PAGE ? String(rows.at(-1)?.latestId) : null
  };
}

export function blockedAccounts(
  db: Database,
  userId: number,
  cursor: number | null
): Promise<ApiCursorPage<ModeratedAccount>> {
  return accountsPage(
    db,
    {
      accountId: blocks.blockedId,
      recordId: blocks.id,
      table: blocks,
      condition: and(
        eq(blocks.blockerId, userId),
        notExists(
          db
            .select({ id: unblocks.id })
            .from(unblocks)
            .where(eq(unblocks.blockId, blocks.id))
        )
      )
    },
    cursor
  );
}

export function mutedAccounts(
  db: Database,
  userId: number,
  cursor: number | null
): Promise<ApiCursorPage<ModeratedAccount>> {
  return accountsPage(
    db,
    {
      accountId: mutes.mutedId,
      recordId: mutes.id,
      table: mutes,
      condition: and(
        eq(mutes.muterId, userId),
        notExists(
          db
            .select({ id: unmutes.id })
            .from(unmutes)
            .where(eq(unmutes.muteId, mutes.id))
        )
      )
    },
    cursor
  );
}

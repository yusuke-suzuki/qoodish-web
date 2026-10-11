import type {
  ApiCursorPage,
  CoauthorshipInvitation,
  ModeratedAccount,
  Profile,
  WebPushPreferences
} from '@qoodish/api-contract';
import { and, asc, desc, eq, notExists, type SQL, sql } from 'drizzle-orm';
import { type Database, uniqueIds } from './db/client.ts';
import {
  blocks,
  coauthorshipInvitations,
  images,
  maps,
  mutes,
  unblocks,
  unmutes,
  userPreferences,
  users
} from './db/schema.ts';
import { primaryImage } from './images.ts';
import { firstImageUrls, mapImagesQuery } from './maps.ts';
import {
  chapterAuthor,
  profileAttributes,
  profileQuery,
  userColumns,
  userSummary,
  usersQuery
} from './users.ts';

const ACCOUNTS_PER_PAGE = 50;

const WEB_PUSH_DEFAULTS: WebPushPreferences = {
  coauthor_invited: true,
  liked: true,
  comment: true,
  published: true
};

function effectiveWebPush(stored: string | undefined): WebPushPreferences {
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

export async function profile(db: Database, userId: number): Promise<Profile> {
  const [[user], [preference]] = await db.batch([
    profileQuery(db, userId),
    db
      .select({ webPush: userPreferences.webPush })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .orderBy(desc(userPreferences.id))
      .limit(1)
  ]);
  return {
    ...profileAttributes(user),
    push_notification: effectiveWebPush(preference?.webPush)
  };
}

export async function pendingInvitations(
  db: Database,
  userId: number
): Promise<CoauthorshipInvitation[]> {
  const rows = await db
    .select({
      id: coauthorshipInvitations.id,
      inviterId: coauthorshipInvitations.inviterId,
      createdAt: coauthorshipInvitations.createdAt,
      updatedAt: coauthorshipInvitations.updatedAt,
      mapId: maps.id,
      mapName: maps.name,
      mapDescription: maps.description,
      mapRevisionId: maps.currentRevisionId
    })
    .from(coauthorshipInvitations)
    .innerJoin(maps, eq(maps.id, coauthorshipInvitations.mapId))
    .where(
      and(
        eq(coauthorshipInvitations.inviteeId, userId),
        eq(coauthorshipInvitations.status, 0)
      )
    )
    .orderBy(
      desc(coauthorshipInvitations.createdAt),
      asc(coauthorshipInvitations.id)
    );

  if (rows.length === 0) {
    return [];
  }

  const [inviters, revisionImages] = await db.batch([
    usersQuery(db, uniqueIds(rows.map((row) => row.inviterId))),
    mapImagesQuery(db, uniqueIds(rows.map((row) => row.mapRevisionId)))
  ]);
  const invitersById = new Map(inviters.map((user) => [user.id, user]));
  const imageUrls = firstImageUrls(revisionImages);

  return rows.flatMap((row) => {
    const inviter = invitersById.get(row.inviterId);

    if (!inviter) {
      return [];
    }

    return [
      {
        id: row.id,
        map: {
          id: row.mapId,
          name: row.mapName,
          description: row.mapDescription,
          ...primaryImage(
            row.mapRevisionId === null
              ? undefined
              : imageUrls.get(row.mapRevisionId)
          )
        },
        inviter: userSummary(inviter),
        status: 'pending',
        created_at: row.createdAt,
        updated_at: row.updatedAt
      }
    ];
  });
}

async function accountsPage(
  db: Database,
  query: {
    accountId: typeof blocks.blockedId | typeof mutes.mutedId;
    recordId: typeof blocks.id | typeof mutes.id;
    table: typeof blocks | typeof mutes;
    condition: SQL;
  },
  cursor: number | null
): Promise<ApiCursorPage<ModeratedAccount>> {
  const latestId = sql<number>`max(${query.recordId})`;
  const rows = await db
    .select({ ...userColumns, latestId })
    .from(query.table)
    .innerJoin(users, eq(users.id, query.accountId))
    .leftJoin(images, eq(images.id, users.imageId))
    .where(query.condition)
    .groupBy(query.accountId)
    .having(cursor === null ? undefined : sql`${latestId} < ${cursor}`)
    .orderBy(sql`${latestId} DESC`)
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
      ) as SQL
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
      ) as SQL
    },
    cursor
  );
}

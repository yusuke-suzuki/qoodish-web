import type {
  ApiCursorPage,
  CoauthorshipInvitation,
  CoauthorshipInvitationStatus,
  ModeratedAccount,
  Profile,
  WebPushPreferences
} from '@qoodish/api-contract';
import { and, asc, desc, eq, notExists, type SQL, sql } from 'drizzle-orm';
import { type Database, uniqueIds } from '../db/client.ts';
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
} from '../db/schema.ts';
import { firstImageUrls, mapImagesQuery } from '../guest/maps.ts';
import {
  profileCounts,
  userColumns,
  userSummary,
  usersQuery
} from '../guest/users.ts';
import { primaryImage } from '../images.ts';

const ACCOUNTS_PER_PAGE = 50;

const WEB_PUSH_DEFAULTS: WebPushPreferences = {
  coauthor_invited: true,
  liked: true,
  comment: true,
  published: true
};

const INVITATION_STATUSES: readonly CoauthorshipInvitationStatus[] = [
  'pending',
  'accepted',
  'declined'
];

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
    db
      .select({ ...userColumns, uid: users.uid, ...profileCounts(db) })
      .from(users)
      .leftJoin(images, eq(images.id, users.imageId))
      .where(eq(users.id, userId)),
    db
      .select({ webPush: userPreferences.webPush })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .orderBy(desc(userPreferences.id))
      .limit(1)
  ]);
  const { image, image_url } = primaryImage(user.imageUrl ?? undefined);

  return {
    id: user.id,
    uid: user.uid,
    name: user.name ?? '',
    biography: user.biography,
    image,
    image_url,
    maps_count: user.mapsCount,
    bookmarked_maps_count: user.bookmarkedMapsCount,
    pins_count: user.pinsCount,
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
      status: coauthorshipInvitations.status,
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
        status: INVITATION_STATUSES[row.status] ?? 'pending',
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
    .select({ accountId: query.accountId, latestId })
    .from(query.table)
    .where(query.condition)
    .groupBy(query.accountId)
    .having(cursor === null ? undefined : sql`${latestId} < ${cursor}`)
    .orderBy(sql`${latestId} DESC`)
    .limit(ACCOUNTS_PER_PAGE);
  const accounts = await usersQuery(
    db,
    rows.map((row) => row.accountId)
  );
  const accountsById = new Map(accounts.map((user) => [user.id, user]));

  return {
    data: rows.flatMap((row) => {
      const account = accountsById.get(row.accountId);

      if (!account) {
        return [];
      }

      const { image, image_url } = primaryImage(account.imageUrl ?? undefined);

      return [
        {
          id: account.id,
          name: account.name ?? '',
          biography: account.biography,
          image,
          image_url
        }
      ];
    }),
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

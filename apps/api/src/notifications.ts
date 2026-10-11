import type {
  ApiCursorPage,
  NotifiableType,
  NotificationGroup,
  NotificationKey,
  UserSummary
} from '@qoodish/api-contract';
import {
  and,
  asc,
  eq,
  inArray,
  or,
  type SQL,
  type SQLWrapper,
  sql
} from 'drizzle-orm';
import { type Database, inIds, uniqueIds } from './db/client.ts';
import {
  chapterRevisionImages,
  chapters,
  comments,
  images,
  mapRevisionImages,
  maps,
  notifications,
  pinRevisionImages,
  pins,
  users
} from './db/schema.ts';
import { primaryImage } from './images.ts';
import { userSummary, usersQuery } from './users.ts';
import { shownTo, type Viewer } from './visibility.ts';

const KEYS: readonly NotificationKey[] = [
  'coauthor_invited',
  'liked',
  'comment',
  'published'
];
const PER_PAGE = 20;
const NOTIFIERS_LIMIT = 2;

type Notifiable = {
  status: string;
  imageUrl: string | null;
};

type Summary = {
  key: string | null;
  notifiableType: string | null;
  notifiableId: number | null;
  latestId: number;
  read: number | null;
};

function groupKey(row: {
  key: string | null;
  notifiableType: string | null;
  notifiableId: number | null;
}): string {
  return JSON.stringify([row.key, row.notifiableType, row.notifiableId]);
}

function received(viewer: Viewer): SQL {
  return and(
    eq(notifications.recipientType, 'User'),
    eq(notifications.recipientId, viewer.id),
    inArray(notifications.key, [...KEYS]),
    sql`${notifications.notifierId} IN (SELECT ${users.id} FROM ${users})`,
    shownTo(viewer, notifications.notifierId)
  ) as SQL;
}

function firstImageUrl(subquery: SQLWrapper) {
  return sql<string | null>`(${subquery})`.as('image_url');
}

function pathTo(type: string, id: number): string {
  switch (type) {
    case 'Pin':
      return `/pins/${id}`;
    case 'Map':
      return `/maps/${id}`;
    case 'Chapter':
      return `/chapters/${id}`;
    default:
      return '';
  }
}

export async function notificationGroups(
  db: Database,
  viewer: Viewer,
  { cursor, unread }: { cursor: number | null; unread: boolean }
): Promise<ApiCursorPage<NotificationGroup>> {
  const summaries: Summary[] = await db
    .select({
      key: notifications.key,
      notifiableType: notifications.notifiableType,
      notifiableId: notifications.notifiableId,
      latestId: sql<number>`max(${notifications.id})`,
      read: sql<number | null>`min(${notifications.read})`
    })
    .from(notifications)
    .where(received(viewer))
    .groupBy(
      notifications.key,
      notifications.notifiableType,
      notifications.notifiableId
    )
    .having(
      and(
        cursor === null ? undefined : sql`max(${notifications.id}) < ${cursor}`,
        unread ? sql`min(${notifications.read}) = 0` : undefined
      )
    )
    .orderBy(sql`max(${notifications.id}) DESC`)
    .limit(PER_PAGE);
  const nextCursor =
    summaries.length === PER_PAGE ? String(summaries.at(-1)?.latestId) : null;

  if (summaries.length === 0) {
    return { data: [], next_cursor: nextCursor };
  }

  const latestByNotifier = await db
    .select({
      key: notifications.key,
      notifiableType: notifications.notifiableType,
      notifiableId: notifications.notifiableId,
      notifierId: notifications.notifierId,
      latestId: sql<number>`max(${notifications.id})`
    })
    .from(notifications)
    .where(
      and(
        received(viewer),
        sql`(${notifications.key}, ${notifications.notifiableType}, ${notifications.notifiableId}) IN (SELECT value ->> 0, value ->> 1, value ->> 2 FROM json_each(${JSON.stringify(summaries.map((summary) => [summary.key, summary.notifiableType, summary.notifiableId]))}))`
      )
    )
    .groupBy(
      notifications.key,
      notifications.notifiableType,
      notifications.notifiableId,
      notifications.notifierId
    );
  const notifiersByGroup = Map.groupBy(latestByNotifier, groupKey);
  const latestIds = new Map(
    [...notifiersByGroup].map(([key, rows]) => [
      key,
      rows
        .map((row) => row.latestId)
        .sort((left, right) => right - left)
        .slice(0, NOTIFIERS_LIMIT)
    ])
  );
  const notifiableIds = (type: string) =>
    uniqueIds(
      summaries
        .filter((summary) => summary.notifiableType === type)
        .map((summary) => summary.notifiableId)
    );
  const commentIds = notifiableIds('Comment');
  const commentable = (type: string, column: SQLWrapper) =>
    sql`${column} IN (SELECT ${comments.commentableId} FROM ${comments} WHERE ${comments.commentableType} = ${type} AND ${inIds(comments.id, commentIds)})`;

  const [records, notifiers, pinRows, mapRows, chapterRows, commentRows] =
    await db.batch([
      db
        .select()
        .from(notifications)
        .where(inIds(notifications.id, [...latestIds.values()].flat())),
      usersQuery(db, uniqueIds(latestByNotifier.map((row) => row.notifierId))),
      db
        .select({
          id: pins.id,
          status: pins.status,
          imageUrl: firstImageUrl(
            db
              .select({ url: images.url })
              .from(pinRevisionImages)
              .innerJoin(images, eq(images.id, pinRevisionImages.imageId))
              .where(
                eq(pinRevisionImages.pinRevisionId, pins.currentRevisionId)
              )
              .orderBy(asc(images.id))
              .limit(1)
          )
        })
        .from(pins)
        .where(
          or(inIds(pins.id, notifiableIds('Pin')), commentable('Pin', pins.id))
        ),
      db
        .select({
          id: maps.id,
          status: maps.status,
          imageUrl: firstImageUrl(
            db
              .select({ url: images.url })
              .from(mapRevisionImages)
              .innerJoin(images, eq(images.id, mapRevisionImages.imageId))
              .where(
                eq(mapRevisionImages.mapRevisionId, maps.currentRevisionId)
              )
              .orderBy(asc(images.id))
              .limit(1)
          )
        })
        .from(maps)
        .where(inIds(maps.id, notifiableIds('Map'))),
      db
        .select({
          id: chapters.id,
          status: chapters.status,
          imageUrl: firstImageUrl(
            db
              .select({ url: images.url })
              .from(chapterRevisionImages)
              .innerJoin(images, eq(images.id, chapterRevisionImages.imageId))
              .where(
                eq(
                  chapterRevisionImages.chapterRevisionId,
                  chapters.currentRevisionId
                )
              )
              .orderBy(asc(images.id))
              .limit(1)
          )
        })
        .from(chapters)
        .where(
          or(
            inIds(chapters.id, notifiableIds('Chapter')),
            commentable('Chapter', chapters.id)
          )
        ),
      db
        .select({
          id: comments.id,
          status: comments.status,
          commentableType: comments.commentableType,
          commentableId: comments.commentableId
        })
        .from(comments)
        .where(inIds(comments.id, commentIds))
        .orderBy(asc(comments.id))
    ]);

  const recordsById = new Map(records.map((record) => [record.id, record]));
  const notifiersById = new Map(notifiers.map((user) => [user.id, user]));
  const posts = new Map<string, Notifiable>([
    ...pinRows.map((row) => [`Pin:${row.id}`, row] as const),
    ...mapRows.map((row) => [`Map:${row.id}`, row] as const),
    ...chapterRows.map((row) => [`Chapter:${row.id}`, row] as const)
  ]);
  const commentsById = new Map(commentRows.map((row) => [row.id, row]));
  const present = (post: Notifiable | undefined): post is Notifiable =>
    post !== undefined && post.status !== 'deleted';

  const data = summaries.flatMap((summary): NotificationGroup[] => {
    const ids = latestIds.get(groupKey(summary)) ?? [];
    const notification = recordsById.get(ids[0] ?? 0);
    const notifier =
      notification?.notifierId == null
        ? undefined
        : notifiersById.get(notification.notifierId);

    if (
      !notification ||
      !notifier ||
      notification.notifiableType === null ||
      notification.notifiableId === null
    ) {
      return [];
    }

    const type = notification.notifiableType;
    const id = notification.notifiableId;
    let shown: Notifiable | undefined;
    let linked = { type, id };

    if (type === 'Comment') {
      const comment = commentsById.get(id);
      const parent = comment
        ? posts.get(`${comment.commentableType}:${comment.commentableId}`)
        : undefined;

      if (!comment || comment.status === 'deleted' || !present(parent)) {
        return [];
      }

      shown = parent;
      linked = {
        type: comment.commentableType,
        id: comment.commentableId
      };
    } else {
      shown = posts.get(`${type}:${id}`);

      if (!present(shown)) {
        return [];
      }
    }

    const key = notification.key as NotificationKey;
    const notifierSummaries = ids.flatMap((notificationId): UserSummary[] => {
      const notifierId = recordsById.get(notificationId)?.notifierId;
      const user =
        notifierId == null ? undefined : notifiersById.get(notifierId);

      return user ? [userSummary(user)] : [];
    });

    return [
      {
        id: notification.id,
        key,
        click_action:
          key === 'coauthor_invited'
            ? '/coauthorship_invitations'
            : key === 'liked'
              ? pathTo(linked.type, linked.id)
              : pathTo(type, id),
        notifiable: {
          id,
          type: type.toLowerCase() as NotifiableType,
          ...primaryImage(shown.imageUrl ?? undefined)
        },
        notifier: userSummary(notifier),
        read: summary.read === 1,
        notifiers: notifierSummaries,
        notifiers_count: notifiersByGroup.get(groupKey(summary))?.length ?? 0,
        created_at: notification.createdAt,
        updated_at: notification.updatedAt
      }
    ];
  });

  return { data, next_cursor: nextCursor };
}

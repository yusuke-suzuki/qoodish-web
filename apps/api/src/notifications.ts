import type {
  ApiCursorPage,
  NotifiableType,
  Notification,
  NotificationGroup,
  NotificationKey,
  UserSummary
} from '@qoodish/api-contract';
import {
  and,
  asc,
  eq,
  inArray,
  isNull,
  lte,
  or,
  type SQL,
  type SQLWrapper,
  sql
} from 'drizzle-orm';
import {
  currentTimestamp,
  type Database,
  inIds,
  uniqueIds
} from './db/client.ts';
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
import { ApiError } from './errors.ts';
import { primaryImage } from './images.ts';
import { first } from './routing.ts';
import { type UserRow, userSummary, usersQuery } from './users.ts';
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

function received(db: Database, viewer: Viewer): SQL | undefined {
  return and(
    eq(notifications.recipientType, 'User'),
    eq(notifications.recipientId, viewer.id),
    inArray(notifications.key, [...KEYS]),
    inArray(notifications.notifierId, db.select({ id: users.id }).from(users)),
    shownTo(viewer, notifications.notifierId)
  );
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
    .where(received(db, viewer))
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
        received(db, viewer),
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
  const [records, notifiers, ...notifiableRows] = await db.batch([
    db
      .select()
      .from(notifications)
      .where(inIds(notifications.id, [...latestIds.values()].flat())),
    usersQuery(db, uniqueIds(latestByNotifier.map((row) => row.notifierId))),
    ...notifiableQueries(
      db,
      summaries.map((summary) => ({
        type: summary.notifiableType,
        id: summary.notifiableId
      }))
    )
  ]);

  const recordsById = new Map(records.map((record) => [record.id, record]));
  const notifiersById = new Map(notifiers.map((user) => [user.id, user]));
  const notifiableOf = notifiableResolver(notifiableRows);

  const data = summaries.flatMap((summary): NotificationGroup[] => {
    const ids = latestIds.get(groupKey(summary)) ?? [];
    const notification = recordsById.get(ids[0] ?? 0);
    const notifier =
      notification?.notifierId == null
        ? undefined
        : notifiersById.get(notification.notifierId);
    const rendered =
      notification && notifier
        ? renderNotification(notification, notifier, notifiableOf)
        : null;

    if (!rendered) {
      return [];
    }

    const notifierSummaries = ids.flatMap((notificationId): UserSummary[] => {
      const notifierId = recordsById.get(notificationId)?.notifierId;
      const user =
        notifierId == null ? undefined : notifiersById.get(notifierId);

      return user ? [userSummary(user)] : [];
    });

    return [
      {
        ...rendered,
        read: summary.read === 1,
        notifiers: notifierSummaries,
        notifiers_count: notifiersByGroup.get(groupKey(summary))?.length ?? 0
      }
    ];
  });

  return { data, next_cursor: nextCursor };
}

type NotifiableRef = { type: string | null; id: number | null };

function notifiableQueries(db: Database, refs: readonly NotifiableRef[]) {
  const idsOf = (type: string) =>
    uniqueIds(refs.filter((ref) => ref.type === type).map((ref) => ref.id));
  const commentIds = idsOf('Comment');
  const commentable = (type: string, column: SQLWrapper) =>
    inArray(
      column,
      db
        .select({ id: comments.commentableId })
        .from(comments)
        .where(
          and(
            eq(comments.commentableType, type),
            inIds(comments.id, commentIds)
          )
        )
    );

  return [
    db
      .select({
        id: pins.id,
        status: pins.status,
        imageUrl: firstImageUrl(
          db
            .select({ url: images.url })
            .from(pinRevisionImages)
            .innerJoin(images, eq(images.id, pinRevisionImages.imageId))
            .where(eq(pinRevisionImages.pinRevisionId, pins.currentRevisionId))
            .orderBy(asc(images.id))
            .limit(1)
        )
      })
      .from(pins)
      .where(or(inIds(pins.id, idsOf('Pin')), commentable('Pin', pins.id))),
    db
      .select({
        id: maps.id,
        status: maps.status,
        imageUrl: firstImageUrl(
          db
            .select({ url: images.url })
            .from(mapRevisionImages)
            .innerJoin(images, eq(images.id, mapRevisionImages.imageId))
            .where(eq(mapRevisionImages.mapRevisionId, maps.currentRevisionId))
            .orderBy(asc(images.id))
            .limit(1)
        )
      })
      .from(maps)
      .where(inIds(maps.id, idsOf('Map'))),
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
          inIds(chapters.id, idsOf('Chapter')),
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
  ] as const;
}

type PostRow = Notifiable & { id: number };

type CommentRef = {
  id: number;
  status: string;
  commentableType: string;
  commentableId: number;
};

type NotifiableRows = readonly [PostRow[], PostRow[], PostRow[], CommentRef[]];

type Shown = { imageUrl: string | null; linked: { type: string; id: number } };

function notifiableResolver([
  pinRows,
  mapRows,
  chapterRows,
  commentRows
]: NotifiableRows) {
  const posts = new Map<string, Notifiable>([
    ...pinRows.map((row) => [`Pin:${row.id}`, row] as const),
    ...mapRows.map((row) => [`Map:${row.id}`, row] as const),
    ...chapterRows.map((row) => [`Chapter:${row.id}`, row] as const)
  ]);
  const commentsById = new Map(commentRows.map((row) => [row.id, row]));
  const present = (post: Notifiable | undefined): post is Notifiable =>
    post !== undefined && post.status !== 'deleted';

  return (type: string, id: number): Shown | null => {
    if (type !== 'Comment') {
      const post = posts.get(`${type}:${id}`);

      return present(post)
        ? { imageUrl: post.imageUrl, linked: { type, id } }
        : null;
    }

    const comment = commentsById.get(id);
    const parent = comment
      ? posts.get(`${comment.commentableType}:${comment.commentableId}`)
      : undefined;

    if (!comment || comment.status === 'deleted' || !present(parent)) {
      return null;
    }

    return {
      imageUrl: parent.imageUrl,
      linked: { type: comment.commentableType, id: comment.commentableId }
    };
  };
}

function renderNotification(
  notification: typeof notifications.$inferSelect,
  notifier: UserRow,
  notifiableOf: ReturnType<typeof notifiableResolver>
): Notification | null {
  const { notifiableType: type, notifiableId: id } = notification;

  if (type === null || id === null) {
    return null;
  }

  const shown = notifiableOf(type, id);

  if (!shown) {
    return null;
  }

  const key = notification.key as NotificationKey;

  return {
    id: notification.id,
    key,
    click_action:
      key === 'coauthor_invited'
        ? '/coauthorship_invitations'
        : key === 'liked'
          ? pathTo(shown.linked.type, shown.linked.id)
          : pathTo(type, id),
    notifiable: {
      id,
      type: type.toLowerCase() as NotifiableType,
      ...primaryImage(shown.imageUrl ?? undefined)
    },
    notifier: userSummary(notifier),
    read: notification.read === true,
    created_at: notification.createdAt,
    updated_at: notification.updatedAt
  };
}

export async function readNotification(
  db: Database,
  viewer: Viewer,
  id: number
): Promise<Notification> {
  const notification = first(
    await db
      .select()
      .from(notifications)
      .where(and(received(db, viewer), eq(notifications.id, id)))
  );
  const [notifiers, ...notifiableRows] = await db.batch([
    usersQuery(db, uniqueIds([notification.notifierId])),
    ...notifiableQueries(db, [
      { type: notification.notifiableType, id: notification.notifiableId }
    ])
  ]);
  const [notifier] = notifiers;
  const { notifiableType } = notification;

  if (!notifier || notifiableType === null) {
    throw new ApiError('NotFound');
  }

  const rendered = renderNotification(
    notification,
    notifier,
    notifiableResolver(notifiableRows)
  );

  if (!rendered) {
    throw new ApiError('NotFound');
  }

  const updated = await db
    .update(notifications)
    .set({ read: true, updatedAt: currentTimestamp() })
    .where(
      and(
        eq(notifications.recipientType, 'User'),
        eq(notifications.recipientId, viewer.id),
        eq(notifications.key, rendered.key),
        eq(notifications.notifiableType, notifiableType),
        eq(notifications.notifiableId, rendered.notifiable.id),
        lte(notifications.id, notification.id),
        or(eq(notifications.read, false), isNull(notifications.read))
      )
    )
    .returning({ id: notifications.id, updatedAt: notifications.updatedAt });
  const read = updated.find((row) => row.id === notification.id);

  return {
    ...rendered,
    read: true,
    updated_at: read?.updatedAt ?? rendered.updated_at
  };
}

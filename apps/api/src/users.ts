import type {
  GuestChapterAuthor,
  GuestUserProfile,
  UserProfile,
  UserSummary,
  ViewerRelation
} from '@qoodish/api-contract';
import { and, eq, inArray } from 'drizzle-orm';
import { type Database, inIds } from './db/client.ts';
import {
  bookmarks,
  images,
  journals,
  maps,
  pins,
  users,
  votes
} from './db/schema.ts';
import { primaryImage } from './images.ts';
import { first, toId } from './routing.ts';
import type { Viewer } from './visibility.ts';

export type UserRow = {
  id: number;
  name: string | null;
  biography: string | null;
  imageUrl: string | null;
};

export const userColumns = {
  id: users.id,
  name: users.name,
  biography: users.biography,
  imageUrl: images.url
};

export function usersQuery(db: Database, ids: readonly number[]) {
  return db
    .select(userColumns)
    .from(users)
    .leftJoin(images, eq(images.id, users.imageId))
    .where(inIds(users.id, ids));
}

export function journalsQuery(db: Database, userIds: readonly number[]) {
  return db
    .select({ id: journals.id, title: journals.title, userId: journals.userId })
    .from(journals)
    .where(inIds(journals.userId, userIds));
}

export function relation(viewer: Viewer, userId: number): ViewerRelation {
  return {
    blocking: viewer.blocking.has(userId),
    muting: viewer.muting.has(userId)
  };
}

export async function findUser(db: Database, param: string | undefined) {
  return first(
    await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, toId(param)))
  );
}

export function userSummary(user: UserRow): UserSummary {
  return {
    id: user.id,
    name: user.name ?? '',
    ...primaryImage(user.imageUrl ?? undefined)
  };
}

export function chapterAuthor(user: UserRow): GuestChapterAuthor {
  const { image, image_url } = primaryImage(user.imageUrl ?? undefined);

  return {
    id: user.id,
    name: user.name ?? '',
    biography: user.biography,
    image,
    image_url
  };
}

export function profileCounts(db: Database) {
  return {
    mapsCount: db.$count(
      maps,
      and(eq(maps.userId, users.id), eq(maps.status, 'published'))
    ),
    bookmarkedMapsCount: db.$count(
      bookmarks,
      and(
        eq(bookmarks.userId, users.id),
        inArray(
          bookmarks.mapId,
          db
            .select({ id: maps.id })
            .from(maps)
            .where(eq(maps.status, 'published'))
        )
      )
    ),
    pinsCount: db.$count(
      pins,
      and(eq(pins.userId, users.id), eq(pins.status, 'published'))
    )
  };
}

export async function guestProfile(
  db: Database,
  id: number
): Promise<GuestUserProfile | null> {
  const [user] = await db
    .select({
      ...userColumns,
      ...profileCounts(db),
      likesCount: db.$count(
        votes,
        and(eq(votes.voterId, users.id), eq(votes.voterType, 'User'))
      )
    })
    .from(users)
    .leftJoin(images, eq(images.id, users.imageId))
    .where(eq(users.id, id));

  if (!user) {
    return null;
  }

  const { image, image_url } = primaryImage(user.imageUrl ?? undefined);

  return {
    id: user.id,
    name: user.name ?? '',
    biography: user.biography,
    image,
    image_url,
    maps_count: user.mapsCount,
    bookmarked_maps_count: user.bookmarkedMapsCount,
    pins_count: user.pinsCount,
    likes_count: user.likesCount
  };
}

export async function userProfile(
  db: Database,
  viewer: Viewer,
  id: number
): Promise<UserProfile | null> {
  const [user] = await db
    .select({ ...userColumns, uid: users.uid, ...profileCounts(db) })
    .from(users)
    .leftJoin(images, eq(images.id, users.imageId))
    .where(eq(users.id, id));

  if (!user) {
    return null;
  }

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
    blocking: viewer.blocking.has(user.id),
    blocked_by: viewer.blockedBy.has(user.id),
    muting: viewer.muting.has(user.id)
  };
}

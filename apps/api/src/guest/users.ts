import type {
  GuestChapterAuthor,
  GuestUserProfile,
  UserSummary
} from '@qoodish/api-contract';
import { and, eq, sql } from 'drizzle-orm';
import { type Database, inIds } from '../db/client.ts';
import {
  bookmarks,
  images,
  journals,
  maps,
  pins,
  users,
  votes
} from '../db/schema.ts';
import { primaryImage } from '../images.ts';

export type UserRow = {
  id: number;
  name: string | null;
  biography: string | null;
  imageUrl: string | null;
};

const userColumns = {
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

export async function guestProfile(
  db: Database,
  id: number
): Promise<GuestUserProfile | null> {
  const [user] = await db
    .select({
      ...userColumns,
      mapsCount: sql<number>`(SELECT count(*) FROM ${maps} WHERE ${and(eq(maps.userId, users.id), eq(maps.status, 'published'))})`,
      bookmarkedMapsCount: sql<number>`(SELECT count(*) FROM ${bookmarks} INNER JOIN ${maps} ON ${eq(maps.id, bookmarks.mapId)} WHERE ${and(eq(bookmarks.userId, users.id), eq(maps.status, 'published'))})`,
      pinsCount: sql<number>`(SELECT count(*) FROM ${pins} WHERE ${and(eq(pins.userId, users.id), eq(pins.status, 'published'))})`,
      likesCount: sql<number>`(SELECT count(*) FROM ${votes} WHERE ${and(eq(votes.voterId, users.id), eq(votes.voterType, 'User'))})`
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

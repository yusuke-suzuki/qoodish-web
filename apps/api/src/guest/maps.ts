import type {
  GuestCoauthor,
  GuestMap,
  PinProperty
} from '@qoodish/api-contract';
import { and, asc, eq } from 'drizzle-orm';
import { type Database, inIds, uniqueIds } from '../db/client.ts';
import {
  coauthorships,
  images,
  mapRevisionImages,
  type maps,
  pinProperties,
  pinPropertyOptions,
  users
} from '../db/schema.ts';
import { primaryImage } from '../images.ts';
import { type UserRow, userColumns, userSummary, usersQuery } from './users.ts';

export type MapRow = typeof maps.$inferSelect;

export function firstImageUrls(
  rows: readonly { revisionId: number; url: string }[]
): Map<number, string> {
  const urls = new Map<number, string>();

  for (const row of rows) {
    if (!urls.has(row.revisionId)) {
      urls.set(row.revisionId, row.url);
    }
  }

  return urls;
}

export function mapImagesQuery(db: Database, revisionIds: readonly number[]) {
  return db
    .select({ revisionId: mapRevisionImages.mapRevisionId, url: images.url })
    .from(mapRevisionImages)
    .innerJoin(images, eq(images.id, mapRevisionImages.imageId))
    .where(inIds(mapRevisionImages.mapRevisionId, revisionIds))
    .orderBy(images.id);
}

export async function coauthorsOf(
  db: Database,
  map: { id: number; userId: number }
): Promise<GuestCoauthor[]> {
  const columns = {
    ...userColumns,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt
  };
  const [owners, coauthors] = await db.batch([
    db
      .select(columns)
      .from(users)
      .leftJoin(images, eq(images.id, users.imageId))
      .where(eq(users.id, map.userId)),
    db
      .select(columns)
      .from(coauthorships)
      .innerJoin(users, eq(users.id, coauthorships.userId))
      .leftJoin(images, eq(images.id, users.imageId))
      .where(eq(coauthorships.mapId, map.id))
      .orderBy(asc(coauthorships.userId))
  ]);

  return [...owners, ...coauthors].map((user) => ({
    ...userSummary(user),
    author: user.id === map.userId,
    created_at: user.createdAt,
    updated_at: user.updatedAt
  }));
}

export async function pinPropertiesOf(
  db: Database,
  mapId: number
): Promise<PinProperty[]> {
  const properties = await db
    .select()
    .from(pinProperties)
    .where(
      and(eq(pinProperties.mapId, mapId), eq(pinProperties.status, 'published'))
    )
    .orderBy(asc(pinProperties.position), asc(pinProperties.id));
  const options =
    properties.length === 0
      ? []
      : await db
          .select()
          .from(pinPropertyOptions)
          .where(
            and(
              inIds(
                pinPropertyOptions.pinPropertyId,
                properties.map((property) => property.id)
              ),
              eq(pinPropertyOptions.status, 'published')
            )
          )
          .orderBy(
            asc(pinPropertyOptions.position),
            asc(pinPropertyOptions.id)
          );

  return properties.map((property) => ({
    id: property.id,
    name: property.name,
    multiple: property.multiple,
    position: property.position,
    options: options
      .filter((option) => option.pinPropertyId === property.id)
      .map((option) => ({
        id: option.id,
        name: option.name,
        position: option.position
      }))
  }));
}

export async function guestMaps(
  db: Database,
  rows: readonly MapRow[]
): Promise<GuestMap[]> {
  if (rows.length === 0) {
    return [];
  }

  const [authors, revisionImages] = await db.batch([
    usersQuery(db, uniqueIds(rows.map((row) => row.userId))),
    mapImagesQuery(db, uniqueIds(rows.map((row) => row.currentRevisionId)))
  ]);
  const authorsById = new Map<number, UserRow>(
    authors.map((author) => [author.id, author])
  );
  const imageUrls = firstImageUrls(revisionImages);

  return rows.flatMap((row) => {
    const author = authorsById.get(row.userId);

    if (!author) {
      return [];
    }

    return [
      {
        id: row.id,
        author: userSummary(author),
        name: row.name,
        description: row.description,
        latitude: row.latitude,
        longitude: row.longitude,
        bookmarking: false,
        editable: false,
        bookmarkable: false,
        private: row.private as boolean,
        ...primaryImage(
          row.currentRevisionId === null
            ? undefined
            : imageUrls.get(row.currentRevisionId)
        ),
        created_at: row.createdAt,
        updated_at: row.updatedAt
      }
    ];
  });
}

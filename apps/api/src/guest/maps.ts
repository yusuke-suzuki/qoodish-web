import type { GuestMap } from '@qoodish/api-contract';
import { eq } from 'drizzle-orm';
import { type Database, inIds, uniqueIds } from '../db/client.ts';
import { images, mapRevisionImages, type maps } from '../db/schema.ts';
import { primaryImage } from '../images.ts';
import { type UserRow, userSummary, usersQuery } from './users.ts';

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

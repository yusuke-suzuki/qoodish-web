import type { AppMap, Coauthor } from '@qoodish/api-contract';
import { and, eq } from 'drizzle-orm';
import { type Database, inIds, uniqueIds } from '../db/client.ts';
import { bookmarks, coauthorships } from '../db/schema.ts';
import {
  coauthorsOf,
  firstImageUrls,
  type MapRow,
  mapImagesQuery
} from '../guest/maps.ts';
import { type UserRow, userSummary, usersQuery } from '../guest/users.ts';
import { primaryImage } from '../images.ts';
import { relation, type Viewer } from './context.ts';

export async function viewerMaps(
  db: Database,
  viewer: Viewer,
  rows: readonly MapRow[]
): Promise<AppMap[]> {
  if (rows.length === 0) {
    return [];
  }

  const mapIds = rows.map((row) => row.id);
  const [authors, revisionImages, coauthored, bookmarked] = await db.batch([
    usersQuery(db, uniqueIds(rows.map((row) => row.userId))),
    mapImagesQuery(db, uniqueIds(rows.map((row) => row.currentRevisionId))),
    db
      .select({ mapId: coauthorships.mapId })
      .from(coauthorships)
      .where(
        and(
          eq(coauthorships.userId, viewer.id),
          inIds(coauthorships.mapId, mapIds)
        )
      ),
    db
      .select({ mapId: bookmarks.mapId })
      .from(bookmarks)
      .where(
        and(eq(bookmarks.userId, viewer.id), inIds(bookmarks.mapId, mapIds))
      )
  ]);
  const authorsById = new Map<number, UserRow>(
    authors.map((author) => [author.id, author])
  );
  const imageUrls = firstImageUrls(revisionImages);
  const coauthoredIds = new Set(coauthored.map((row) => row.mapId));
  const bookmarkedIds = new Set(bookmarked.map((row) => row.mapId));

  return rows.flatMap((row) => {
    const author = authorsById.get(row.userId);

    if (!author) {
      return [];
    }

    const editable = row.userId === viewer.id || coauthoredIds.has(row.id);
    const isPrivate = row.private as boolean;

    return [
      {
        id: row.id,
        author: { ...userSummary(author), ...relation(viewer, author.id) },
        name: row.name,
        description: row.description,
        latitude: row.latitude,
        longitude: row.longitude,
        bookmarking: bookmarkedIds.has(row.id),
        editable,
        bookmarkable: !isPrivate && !editable,
        private: isPrivate,
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

export async function viewerCoauthors(
  db: Database,
  viewer: Viewer,
  map: { id: number; userId: number }
): Promise<Coauthor[]> {
  const editable = map.userId === viewer.id;

  return (await coauthorsOf(db, map)).map(
    ({ created_at, updated_at, ...coauthor }) => ({
      ...coauthor,
      editable,
      created_at,
      updated_at
    })
  );
}

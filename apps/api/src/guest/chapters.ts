import type {
  ChapterContent,
  ChapterStatus,
  GuestChapter,
  ImageVariants,
  MapFeatureCollection
} from '@qoodish/api-contract';
import { and, asc, count, eq } from 'drizzle-orm';
import { type Database, inIds, uniqueIds } from '../db/client.ts';
import {
  chapterRevisionImages,
  type chapters,
  images,
  maps,
  votes
} from '../db/schema.ts';
import { primaryImage } from '../images.ts';
import { firstImageUrls } from './maps.ts';
import {
  chapterAuthor,
  journalsQuery,
  type UserRow,
  usersQuery
} from './users.ts';

export type ChapterRow = typeof chapters.$inferSelect;

export type ChapterSearchResult = {
  id: number;
  title: string;
  image: ImageVariants | null;
  map: { id: number; name: string };
};

function chapterImagesQuery(db: Database, revisionIds: readonly number[]) {
  return db
    .select({
      revisionId: chapterRevisionImages.chapterRevisionId,
      url: images.url
    })
    .from(chapterRevisionImages)
    .innerJoin(images, eq(images.id, chapterRevisionImages.imageId))
    .where(inIds(chapterRevisionImages.chapterRevisionId, revisionIds))
    .orderBy(asc(images.id));
}

function mapRefsQuery(db: Database, rows: readonly ChapterRow[]) {
  return db
    .select({ id: maps.id, name: maps.name, private: maps.private })
    .from(maps)
    .where(inIds(maps.id, uniqueIds(rows.map((row) => row.mapId))));
}

function revisionImageUrl(
  urls: Map<number, string>,
  revisionId: number | null
): string | undefined {
  return revisionId === null ? undefined : urls.get(revisionId);
}

export async function guestChapters(
  db: Database,
  rows: readonly ChapterRow[]
): Promise<GuestChapter[]> {
  if (rows.length === 0) {
    return [];
  }

  const userIds = uniqueIds(rows.map((row) => row.userId));
  const [authors, journalRefs, mapRefs, revisionImages, likes] = await db.batch(
    [
      usersQuery(db, userIds),
      journalsQuery(db, userIds),
      mapRefsQuery(db, rows),
      chapterImagesQuery(
        db,
        uniqueIds(rows.map((row) => row.currentRevisionId))
      ),
      db
        .select({ chapterId: votes.votableId, likes: count() })
        .from(votes)
        .where(
          and(
            eq(votes.votableType, 'Chapter'),
            inIds(
              votes.votableId,
              rows.map((row) => row.id)
            )
          )
        )
        .groupBy(votes.votableId)
    ]
  );

  const authorsById = new Map<number, UserRow>(
    authors.map((author) => [author.id, author])
  );
  const journalsByUser = new Map(
    journalRefs.map((journal) => [journal.userId, journal])
  );
  const mapsById = new Map(mapRefs.map((map) => [map.id, map]));
  const imageUrls = firstImageUrls(revisionImages);
  const likesByChapter = new Map(
    likes.map((row) => [row.chapterId, row.likes])
  );

  return rows.flatMap((row) => {
    const author = authorsById.get(row.userId);
    const map = row.mapId === null ? undefined : mapsById.get(row.mapId);

    if (!author || !map) {
      return [];
    }

    const journal = journalsByUser.get(row.userId);

    return [
      {
        id: row.id,
        map_id: map.id,
        journey_id: row.journeyId,
        title: row.title,
        status: row.status as ChapterStatus,
        content: JSON.parse(row.content) as ChapterContent,
        map_features: JSON.parse(row.mapFeatures) as MapFeatureCollection,
        ...primaryImage(revisionImageUrl(imageUrls, row.currentRevisionId)),
        author: chapterAuthor(author),
        map: { id: map.id, name: map.name, private: map.private as boolean },
        journal: journal ? { id: journal.id, title: journal.title } : null,
        likes_count: likesByChapter.get(row.id) ?? 0,
        created_at: row.createdAt,
        updated_at: row.updatedAt
      }
    ];
  });
}

export async function chapterSearchResults(
  db: Database,
  rows: readonly ChapterRow[]
): Promise<ChapterSearchResult[]> {
  if (rows.length === 0) {
    return [];
  }

  const [mapRefs, revisionImages] = await db.batch([
    mapRefsQuery(db, rows),
    chapterImagesQuery(db, uniqueIds(rows.map((row) => row.currentRevisionId)))
  ]);
  const mapsById = new Map(mapRefs.map((map) => [map.id, map]));
  const imageUrls = firstImageUrls(revisionImages);

  return rows.flatMap((row) => {
    const map = row.mapId === null ? undefined : mapsById.get(row.mapId);

    if (!map) {
      return [];
    }

    return [
      {
        id: row.id,
        title: row.title,
        image: primaryImage(revisionImageUrl(imageUrls, row.currentRevisionId))
          .image,
        map: { id: map.id, name: map.name }
      }
    ];
  });
}

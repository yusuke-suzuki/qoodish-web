import type {
  ChapterContent,
  ChapterStatus,
  GuestChapter,
  ImageVariants,
  JournalRef,
  MapFeatureCollection,
  MapRef
} from '@qoodish/api-contract';
import { asc, eq } from 'drizzle-orm';
import { type Database, inIds, uniqueIds } from '../db/client.ts';
import {
  chapterRevisionImages,
  type chapters,
  images,
  maps
} from '../db/schema.ts';
import { primaryImage } from '../images.ts';
import { type Likes, likesByVotable, likesQuery } from '../votes.ts';
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

export type ChapterParts = {
  row: ChapterRow;
  author: UserRow;
  map: MapRef | null;
  journal: JournalRef | null;
  imageUrl: string | undefined;
  likes: Likes;
};

export async function loadChapters(
  db: Database,
  rows: readonly ChapterRow[],
  viewerId?: number
): Promise<ChapterParts[]> {
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
      likesQuery(
        db,
        'Chapter',
        rows.map((row) => row.id),
        viewerId
      )
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
  const likesOf = likesByVotable(likes);

  return rows.flatMap((row) => {
    const author = authorsById.get(row.userId);

    if (!author) {
      return [];
    }

    const map = row.mapId === null ? undefined : mapsById.get(row.mapId);
    const journal = journalsByUser.get(row.userId);

    return [
      {
        row,
        author,
        map: map
          ? { id: map.id, name: map.name, private: map.private as boolean }
          : null,
        journal: journal ? { id: journal.id, title: journal.title } : null,
        imageUrl: revisionImageUrl(imageUrls, row.currentRevisionId),
        likes: likesOf(row.id)
      }
    ];
  });
}

export function chapterAttributes(row: ChapterRow) {
  return {
    id: row.id,
    map_id: row.mapId,
    journey_id: row.journeyId,
    title: row.title,
    status: row.status as ChapterStatus,
    content: JSON.parse(row.content) as ChapterContent,
    map_features: JSON.parse(row.mapFeatures) as MapFeatureCollection
  };
}

export async function guestChapters(
  db: Database,
  rows: readonly ChapterRow[]
): Promise<GuestChapter[]> {
  const parts = await loadChapters(db, rows);

  return parts.flatMap(({ row, author, map, journal, imageUrl, likes }) =>
    map
      ? [
          {
            ...chapterAttributes(row),
            map_id: map.id,
            ...primaryImage(imageUrl),
            author: chapterAuthor(author),
            map,
            journal,
            likes_count: likes.likes,
            created_at: row.createdAt,
            updated_at: row.updatedAt
          }
        ]
      : []
  );
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

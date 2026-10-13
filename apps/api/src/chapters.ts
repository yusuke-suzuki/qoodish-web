import type {
  Chapter,
  ChapterContent,
  ChapterDetail,
  ChapterStatus,
  GuestChapter,
  ImageVariants,
  JournalRef,
  MapFeatureCollection,
  MapRef
} from '@qoodish/api-contract';
import {
  and,
  asc,
  eq,
  getTableColumns,
  inArray,
  max,
  ne,
  type SQL,
  type SQLWrapper
} from 'drizzle-orm';
import { z } from 'zod';
import {
  constraintViolated,
  currentTimestamp,
  type Database,
  inIds,
  reviseUntilCurrent,
  scalar,
  uniqueIds,
  unrevisedRecord
} from './db/client.ts';
import {
  chapterRevisionImages,
  chapterRevisions,
  chapters,
  comments,
  images,
  maps
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { MessageKey } from './i18n/index.ts';
import {
  imageOwnersQuery,
  primaryImage,
  sameIds,
  unownedImages
} from './images.ts';
import { firstImageUrls } from './maps.ts';
import { notNotifiedYet, recordNotification } from './notifications.ts';
import { first, present } from './routing.ts';
import {
  chapterAuthor,
  journalsQuery,
  relation,
  type UserRow,
  usersQuery
} from './users.ts';
import { imageIds, optionalId, text } from './validation.ts';
import { shownTo, type Viewer } from './visibility.ts';
import { type Likes, likesByVotable, likesQuery } from './votes.ts';
import { enqueueWebPush, type WebPushMessage } from './web-push.ts';

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

export async function viewerChapters(
  db: Database,
  viewer: Viewer,
  rows: readonly ChapterRow[]
): Promise<Chapter[]> {
  const parts = await loadChapters(db, rows, viewer.id);

  return parts.map(({ row, author, map, journal, imageUrl, likes }) => ({
    ...chapterAttributes(row),
    ...primaryImage(imageUrl),
    author: { ...chapterAuthor(author), ...relation(viewer, author.id) },
    map,
    journal,
    editable: row.userId === viewer.id,
    liked: likes.liked,
    likes_count: likes.likes,
    created_at: row.createdAt,
    updated_at: row.updatedAt
  }));
}

export async function viewerChapterDetails(
  db: Database,
  viewer: Viewer,
  condition: SQL | undefined
): Promise<ChapterDetail[]> {
  const rows = await db
    .select({
      ...getTableColumns(chapters),
      commentsCount: db
        .$count(
          comments,
          and(
            eq(comments.commentableType, 'Chapter'),
            eq(comments.commentableId, chapters.id),
            ne(comments.status, 'deleted'),
            shownTo(viewer, comments.userId)
          )
        )
        .as('comments_count')
    })
    .from(chapters)
    .where(condition);
  const counts = new Map(rows.map((row) => [row.id, row.commentsCount]));

  return (await viewerChapters(db, viewer, rows)).map((chapter) => ({
    ...chapter,
    comments_count: counts.get(chapter.id) ?? 0
  }));
}

const CHAPTER_TITLE_LIMIT = 100;
const CHAPTER_CONTENT_BYTES = 1024 * 1024;
const CHAPTER_MAP_FEATURES_BYTES = 100 * 1024;
const CHAPTER_IMAGE_LIMIT = 1;
const LONGITUDE_LIMIT = 180;
const LATITUDE_LIMIT = 90;
const FEATURE_TEXT_PROPERTIES = ['title', 'description'];
const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection', features: [] };
const REVISABLE_STATUSES = ['draft', 'published', 'deleted'] as const;

type JsonObject = Record<string, unknown>;

function jsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function absent(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

function sameJson(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => sameJson(item, right[index]))
    );
  }

  if (jsonObject(left) && jsonObject(right)) {
    const keys = Object.keys(left);

    return (
      keys.length === Object.keys(right).length &&
      keys.every(
        (key) => Object.hasOwn(right, key) && sameJson(left[key], right[key])
      )
    );
  }

  return left === right;
}

function lexicalDocument(value: unknown): boolean {
  return jsonObject(value) && jsonObject(value.root);
}

function featureProperties(properties: unknown): boolean {
  return (
    absent(properties) ||
    (jsonObject(properties) &&
      FEATURE_TEXT_PROPERTIES.every(
        (key) => absent(properties[key]) || typeof properties[key] === 'string'
      ))
  );
}

function within(value: unknown, limit: number): boolean {
  return typeof value === 'number' && Math.abs(value) <= limit;
}

function pointFeature(feature: unknown): boolean {
  return (
    jsonObject(feature) &&
    feature.type === 'Feature' &&
    featureProperties(feature.properties) &&
    jsonObject(feature.geometry) &&
    feature.geometry.type === 'Point' &&
    Array.isArray(feature.geometry.coordinates) &&
    feature.geometry.coordinates.length === 2 &&
    within(feature.geometry.coordinates[0], LONGITUDE_LIMIT) &&
    within(feature.geometry.coordinates[1], LATITUDE_LIMIT)
  );
}

function featureCollection(value: unknown): boolean {
  return (
    jsonObject(value) &&
    value.type === 'FeatureCollection' &&
    Array.isArray(value.features) &&
    value.features.every(pointFeature)
  );
}

function jsonDocument({
  valid,
  invalid,
  bytes,
  exceed
}: {
  valid: (value: unknown) => boolean;
  invalid: MessageKey;
  bytes: number;
  exceed: MessageKey;
}) {
  return z
    .custom<JsonObject>(valid, { error: invalid, abort: true })
    .refine(
      (document) =>
        new TextEncoder().encode(JSON.stringify(document)).length <= bytes,
      { error: exceed }
    );
}

function submittedObject(value: unknown): JsonObject | undefined {
  return jsonObject(value) ? value : undefined;
}

const chapterContent = jsonDocument({
  valid: lexicalDocument,
  invalid: 'chapter_content_invalid',
  bytes: CHAPTER_CONTENT_BYTES,
  exceed: 'chapter_content_exceed'
});

const chapterMapFeatures = jsonDocument({
  valid: featureCollection,
  invalid: 'chapter_map_features_invalid',
  bytes: CHAPTER_MAP_FEATURES_BYTES,
  exceed: 'chapter_map_features_exceed'
});

const chapterTitle = text({
  required: 'chapter_title_required',
  max: { length: CHAPTER_TITLE_LIMIT, error: 'chapter_title_exceed' }
});

function journeyIdOf(
  value: number | string | null | undefined
): number | null | undefined {
  if (absent(value) || (typeof value === 'string' && !present(value))) {
    return null;
  }

  return optionalId(value);
}

export const newChapterInput = z.object({
  title: chapterTitle,
  content: z.preprocess(submittedObject, chapterContent),
  map_features: z.preprocess(submittedObject, chapterMapFeatures.optional()),
  journey_id: z.union([z.number(), z.string()]).nullish().transform(journeyIdOf)
});

export const chapterInput = z.object({
  status: z
    .enum(REVISABLE_STATUSES, { error: 'chapter_status_invalid' })
    .optional(),
  title: chapterTitle.optional(),
  content: z.preprocess(submittedObject, chapterContent.optional()),
  map_features: z.preprocess(submittedObject, chapterMapFeatures.optional()),
  image_ids: z.preprocess(
    (ids) => ids ?? undefined,
    imageIds({
      max: CHAPTER_IMAGE_LIMIT,
      error: 'chapter_images_exceed'
    }).optional()
  )
});

type RevisionContent = {
  title: string;
  content: string;
  mapFeatures: string;
  status: (typeof REVISABLE_STATUSES)[number];
};

function revisionContentOf(chapter: ChapterRow): RevisionContent {
  return {
    title: chapter.title,
    content: chapter.content,
    mapFeatures: chapter.mapFeatures,
    status: chapter.status as RevisionContent['status']
  };
}

function storedJson(stored: string, submitted: JsonObject | undefined): string {
  return submitted === undefined || sameJson(JSON.parse(stored), submitted)
    ? stored
    : JSON.stringify(submitted);
}

function chapterRevisionStatements(
  db: Database,
  {
    chapterId,
    editorId,
    content,
    imageIds,
    now
  }: {
    chapterId: SQL<number>;
    editorId: number;
    content: RevisionContent;
    imageIds: readonly number[];
    now: string;
  }
) {
  const revisionId = scalar(
    db
      .select({ id: max(chapterRevisions.id).as('id') })
      .from(chapterRevisions)
      .where(eq(chapterRevisions.chapterId, chapterId))
  );

  return [
    db.insert(chapterRevisions).values({
      ...content,
      chapterId,
      userId: editorId,
      createdAt: now,
      updatedAt: now
    }),
    ...(imageIds.length === 0
      ? []
      : [
          db.insert(chapterRevisionImages).values(
            imageIds.map((imageId) => ({
              chapterRevisionId: revisionId,
              imageId,
              createdAt: now,
              updatedAt: now
            }))
          )
        ]),
    db
      .update(chapters)
      .set({ currentRevisionId: revisionId })
      .where(eq(chapters.id, chapterId))
  ] as const;
}

export type JourneyRef = { id: number; mapId: number | null };

export async function createChapter(
  db: Database,
  {
    userId,
    mapId,
    journey,
    changes
  }: {
    userId: number;
    mapId: number;
    journey: JourneyRef | null;
    changes: Omit<z.output<typeof newChapterInput>, 'journey_id'>;
  }
): Promise<number> {
  if (journey && journey.mapId !== mapId) {
    throw ApiError.invalid(['chapter_journey_mismatch']);
  }

  const now = currentTimestamp();
  const content: RevisionContent = {
    title: changes.title,
    content: JSON.stringify(changes.content),
    mapFeatures: JSON.stringify(
      changes.map_features ?? EMPTY_FEATURE_COLLECTION
    ),
    status: 'draft'
  };
  const chapterId = scalar(
    db
      .select({ id: max(chapters.id).as('id') })
      .from(chapters)
      .where(eq(chapters.userId, userId))
  );

  try {
    const [, created] = await db.batch([
      db.insert(chapters).values({
        ...content,
        userId,
        mapId,
        journeyId: journey?.id ?? null,
        createdAt: now,
        updatedAt: now
      }),
      db
        .select({ id: chapters.id })
        .from(chapters)
        .where(eq(chapters.id, chapterId)),
      ...chapterRevisionStatements(db, {
        chapterId,
        editorId: userId,
        content,
        imageIds: [],
        now
      })
    ]);

    return first(created).id;
  } catch (error) {
    if (constraintViolated(error, 'UNIQUE', chapters.journeyId)) {
      throw ApiError.invalid(['duplicate_chapter_for_journey']);
    }

    throw error;
  }
}

function changedContent(
  current: RevisionContent,
  revised: RevisionContent
): Partial<RevisionContent> {
  return Object.fromEntries(
    Object.entries(revised).filter(
      ([key, value]) => current[key as keyof RevisionContent] !== value
    )
  );
}

async function writeChapterRevision(
  db: Database,
  chapter: ChapterRow,
  {
    editorId,
    revised,
    submittedImageIds
  }: {
    editorId: number;
    revised: RevisionContent;
    submittedImageIds?: number[];
  }
): Promise<{ id: number }[]> {
  const current = revisionContentOf(chapter);
  const publishing =
    current.status === 'draft' && revised.status === 'published';
  const ownersQuery =
    submittedImageIds === undefined
      ? []
      : [imageOwnersQuery(db, submittedImageIds)];
  const mapAuthorQuery =
    publishing && chapter.mapId !== null
      ? [
          db
            .select({ userId: maps.userId })
            .from(maps)
            .where(eq(maps.id, chapter.mapId))
        ]
      : [];
  const [carriedRows, ...userRows] = await db.batch([
    db
      .select({ id: chapterRevisionImages.imageId })
      .from(chapterRevisionImages)
      .where(
        inIds(
          chapterRevisionImages.chapterRevisionId,
          uniqueIds([chapter.currentRevisionId])
        )
      )
      .orderBy(asc(chapterRevisionImages.imageId)),
    ...ownersQuery,
    ...mapAuthorQuery
  ]);
  const carried = carriedRows.map((row) => row.id);
  const imageIds = submittedImageIds ?? carried;
  const changes = changedContent(current, revised);

  if (Object.keys(changes).length === 0 && sameIds(imageIds, carried)) {
    return [];
  }

  if (submittedImageIds !== undefined) {
    const imageErrors = unownedImages(
      userRows[0] ?? [],
      submittedImageIds,
      editorId
    );

    if (imageErrors.length > 0) {
      throw ApiError.invalid(imageErrors);
    }
  }

  const now = currentTimestamp();
  const statements = [
    db
      .update(chapters)
      .set({
        ...changes,
        journeyId: revised.status === 'deleted' ? null : chapter.journeyId,
        updatedAt: now
      })
      .where(eq(chapters.id, chapter.id)),
    ...chapterRevisionStatements(db, {
      chapterId: unrevisedRecord(db, chapters, chapter),
      editorId,
      content: revised,
      imageIds,
      now
    })
  ] as const;
  const recipientId =
    mapAuthorQuery.length > 0 ? userRows.at(-1)?.[0]?.userId : undefined;

  if (recipientId === undefined) {
    await db.batch(statements);
    return [];
  }

  const notifiable = { type: 'Chapter', id: chapter.id } as const;
  const [notified] = await db.batch([
    recordNotification(db, {
      key: 'published',
      notifiable,
      notifierId: chapter.userId,
      recipientId,
      now,
      condition: notNotifiedYet(db, { key: 'published', notifiable }),
      acrossBlocks: true
    }),
    ...statements
  ]);

  return notified;
}

export async function reviseChapter(
  db: Database,
  webPush: Queue<WebPushMessage>,
  read: () => Promise<ChapterRow>,
  {
    editorId,
    changes
  }: { editorId: number; changes: z.output<typeof chapterInput> }
): Promise<void> {
  const notified = await reviseUntilCurrent(
    chapterRevisions.chapterId,
    async () => {
      const chapter = await read();
      const current = revisionContentOf(chapter);

      return writeChapterRevision(db, chapter, {
        editorId,
        revised: {
          title: changes.title ?? current.title,
          content: storedJson(current.content, changes.content),
          mapFeatures: storedJson(current.mapFeatures, changes.map_features),
          status: changes.status ?? current.status
        },
        submittedImageIds: changes.image_ids
      });
    }
  );

  await enqueueWebPush(webPush, notified);
}

export async function discardChapter(
  db: Database,
  read: () => Promise<ChapterRow>,
  editorId: number
): Promise<void> {
  await reviseUntilCurrent(chapterRevisions.chapterId, async () => {
    const chapter = await read();

    await writeChapterRevision(db, chapter, {
      editorId,
      revised: { ...revisionContentOf(chapter), status: 'deleted' }
    });
  });
}

export function detachJourneys(db: Database, journeyIds: SQLWrapper) {
  return db
    .update(chapters)
    .set({ journeyId: null })
    .where(inArray(chapters.journeyId, journeyIds));
}

export function detachChaptersFromMaps(db: Database, mapIds: SQLWrapper) {
  return db
    .update(chapters)
    .set({ mapId: null })
    .where(inArray(chapters.mapId, mapIds));
}

export function chapterRevisionsDeletion(db: Database, chapterIds: SQLWrapper) {
  const revisionIds = db
    .select({ id: chapterRevisions.id })
    .from(chapterRevisions)
    .where(inArray(chapterRevisions.chapterId, chapterIds));

  return [
    db
      .delete(chapterRevisionImages)
      .where(inArray(chapterRevisionImages.chapterRevisionId, revisionIds)),
    db
      .delete(chapterRevisions)
      .where(inArray(chapterRevisions.chapterId, chapterIds))
  ] as const;
}

export function chapterRevisionImagesOfImagesDeletion(
  db: Database,
  imageIds: SQLWrapper
) {
  return db
    .delete(chapterRevisionImages)
    .where(inArray(chapterRevisionImages.imageId, imageIds));
}

export function chaptersDeletion(db: Database, chapterIds: SQLWrapper) {
  return db.delete(chapters).where(inArray(chapters.id, chapterIds));
}

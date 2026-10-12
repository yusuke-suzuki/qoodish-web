import type {
  AppMap,
  Coauthor,
  GuestCoauthor,
  GuestMap,
  PinProperty
} from '@qoodish/api-contract';
import { and, asc, eq, inArray, max, or, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { removeMapBookmarks } from './bookmarks.ts';
import {
  currentTimestamp,
  type Database,
  inIds,
  reviseUntilCurrent,
  scalar,
  uniqueIds,
  unrevisedRecord
} from './db/client.ts';
import {
  bookmarks,
  coauthorships,
  images,
  mapRevisionImages,
  mapRevisions,
  maps,
  pinProperties,
  pinPropertyOptions,
  users
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { MessageKey } from './i18n/index.ts';
import { primaryImage, sameIds, unownedImageErrors } from './images.ts';
import { first } from './routing.ts';
import { truncate, withoutCarriageReturns } from './text.ts';
import {
  relation,
  type UserRow,
  userColumns,
  userSummary,
  usersQuery
} from './users.ts';
import { coordinate, imageIds, text } from './validation.ts';
import type { Viewer } from './visibility.ts';

export type MapRow = typeof maps.$inferSelect;

const MAP_NAME_LIMIT = 30;
const MAP_DESCRIPTION_LIMIT = 200;
const MAP_IMAGE_LIMIT = 1;

type MapContent = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  private: boolean;
  status: 'published' | 'deleted';
};

const mapName = text({
  required: 'map_name_required',
  max: { length: MAP_NAME_LIMIT, error: 'map_name_exceed' }
});

const mapDescription = text({
  required: 'map_description_required',
  max: { length: MAP_DESCRIPTION_LIMIT, error: 'map_description_exceed' }
});

const mapSettings = {
  private: z.boolean().optional(),
  latitude: coordinate().optional(),
  longitude: coordinate().optional(),
  image_ids: imageIds({
    max: MAP_IMAGE_LIMIT,
    error: 'map_images_exceed'
  }).optional()
};

function withImageIds<Changes extends { image_ids?: number[] }>({
  image_ids,
  ...changes
}: Changes) {
  return { ...changes, imageIds: image_ids };
}

export const newMapInput = z
  .object({ name: mapName, description: mapDescription, ...mapSettings })
  .transform(withImageIds);

export const mapInput = z
  .object({
    name: mapName.optional(),
    description: mapDescription.optional(),
    ...mapSettings
  })
  .transform(withImageIds);

function newestMapOf(db: Database, userId: number | SQL) {
  return scalar(
    db
      .select({ id: max(maps.id) })
      .from(maps)
      .where(eq(maps.userId, userId))
  );
}

function mapRevisionStatements(
  db: Database,
  {
    mapId,
    editorId,
    content,
    imageIds,
    now
  }: {
    mapId: number | SQL;
    editorId: number | SQL;
    content: MapContent;
    imageIds: readonly number[];
    now: string;
  }
) {
  const revisionId = scalar(
    db
      .select({ id: max(mapRevisions.id) })
      .from(mapRevisions)
      .where(eq(mapRevisions.mapId, mapId))
  );

  return [
    db.insert(mapRevisions).values({
      ...content,
      mapId,
      userId: editorId,
      createdAt: now,
      updatedAt: now
    }),
    ...(imageIds.length === 0
      ? []
      : [
          db.insert(mapRevisionImages).values(
            imageIds.map((imageId) => ({
              mapRevisionId: revisionId,
              imageId,
              createdAt: now,
              updatedAt: now
            }))
          )
        ]),
    db
      .update(maps)
      .set({ currentRevisionId: revisionId })
      .where(eq(maps.id, mapId))
  ] as const;
}

export function recordDefaultMap(
  db: Database,
  { userId, ownerName, now }: { userId: SQL; ownerName: string; now: string }
) {
  const content: MapContent = {
    name: truncate(
      withoutCarriageReturns(`${ownerName}'s map`),
      MAP_NAME_LIMIT
    ),
    description: truncate(
      withoutCarriageReturns(`${ownerName}'s map.`),
      MAP_DESCRIPTION_LIMIT
    ),
    latitude: 0,
    longitude: 0,
    private: true,
    status: 'published'
  };

  return [
    db
      .insert(maps)
      .values({ ...content, userId, createdAt: now, updatedAt: now }),
    ...mapRevisionStatements(db, {
      mapId: newestMapOf(db, userId),
      editorId: userId,
      content,
      imageIds: [],
      now
    })
  ] as const;
}

export async function createMap(
  db: Database,
  userId: number,
  changes: z.output<typeof newMapInput>
): Promise<MapRow> {
  const content: MapContent = {
    name: changes.name,
    description: changes.description,
    latitude: changes.latitude ?? 0,
    longitude: changes.longitude ?? 0,
    private: changes.private ?? true,
    status: 'published'
  };
  const imageIds = changes.imageIds ?? [];
  const [imageErrors, [duplicate]] = await Promise.all([
    unownedImageErrors(db, imageIds, userId),
    db
      .select({ id: maps.id })
      .from(maps)
      .where(and(eq(maps.userId, userId), eq(maps.name, content.name)))
      .limit(1)
  ]);
  const errors: MessageKey[] = [
    ...(duplicate ? (['duplicate_map_name'] as const) : []),
    ...imageErrors
  ];

  if (errors.length > 0) {
    throw ApiError.invalid(errors);
  }

  const now = currentTimestamp();
  const mapId = newestMapOf(db, userId);
  const results = await db.batch([
    db
      .insert(maps)
      .values({ ...content, userId, createdAt: now, updatedAt: now }),
    ...mapRevisionStatements(db, {
      mapId,
      editorId: userId,
      content,
      imageIds,
      now
    }),
    db.select().from(maps).where(eq(maps.id, mapId))
  ]);

  return first(results[results.length - 1] as MapRow[]);
}

async function currentMapImageIds(
  db: Database,
  map: MapRow
): Promise<number[]> {
  if (map.currentRevisionId === null) {
    return [];
  }

  const rows = await db
    .select({ imageId: mapRevisionImages.imageId })
    .from(mapRevisionImages)
    .where(eq(mapRevisionImages.mapRevisionId, map.currentRevisionId))
    .orderBy(asc(mapRevisionImages.imageId));

  return rows.map((row) => row.imageId);
}

function currentMapContent(map: MapRow): MapContent {
  return {
    name: map.name,
    description: map.description,
    latitude: map.latitude,
    longitude: map.longitude,
    private: map.private ?? true,
    status: map.status === 'deleted' ? 'deleted' : 'published'
  };
}

async function writeMapRevision(
  db: Database,
  map: MapRow,
  {
    editorId,
    content,
    imageIds
  }: { editorId: number; content: MapContent; imageIds?: number[] }
): Promise<void> {
  const current = currentMapContent(map);
  const carried = await currentMapImageIds(db, map);
  const submitted = imageIds ?? carried;
  const changed = (Object.keys(content) as (keyof MapContent)[]).some(
    (key) => content[key] !== current[key]
  );

  if (!changed && sameIds(submitted, carried)) {
    return;
  }

  const errors = await unownedImageErrors(db, imageIds ?? [], editorId);

  if (errors.length > 0) {
    throw ApiError.invalid(errors);
  }

  const now = currentTimestamp();

  await db.batch([
    db
      .update(maps)
      .set({ ...content, updatedAt: now })
      .where(eq(maps.id, map.id)),
    ...mapRevisionStatements(db, {
      mapId: unrevisedRecord(db, maps, map),
      editorId,
      content,
      imageIds: submitted,
      now
    }),
    ...(content.private && !current.private
      ? [removeMapBookmarks(db, map.id)]
      : [])
  ]);
}

export function reviseMap(
  db: Database,
  read: () => Promise<MapRow>,
  {
    editorId,
    changes
  }: { editorId: number; changes: z.output<typeof mapInput> }
): Promise<void> {
  return reviseUntilCurrent(mapRevisions.mapId, async () => {
    const map = await read();
    const current = currentMapContent(map);

    await writeMapRevision(db, map, {
      editorId,
      content: {
        ...current,
        name: changes.name ?? current.name,
        description: changes.description ?? current.description,
        latitude: changes.latitude ?? current.latitude,
        longitude: changes.longitude ?? current.longitude,
        private:
          map.userId === editorId
            ? (changes.private ?? current.private)
            : current.private
      },
      imageIds: changes.imageIds
    });
  });
}

export function discardMap(
  db: Database,
  read: () => Promise<MapRow>,
  editorId: number
): Promise<void> {
  return reviseUntilCurrent(mapRevisions.mapId, async () => {
    const map = await read();

    await writeMapRevision(db, map, {
      editorId,
      content: { ...currentMapContent(map), status: 'deleted' }
    });
  });
}

export async function removeCoauthor(
  db: Database,
  { mapId, userId }: { mapId: number; userId: number }
): Promise<void> {
  const [removed] = await db
    .delete(coauthorships)
    .where(
      and(eq(coauthorships.mapId, mapId), eq(coauthorships.userId, userId))
    )
    .returning({ id: coauthorships.id });

  if (!removed) {
    throw new ApiError('NotFound');
  }
}

export function mapIdsOf(db: Database, authorId: number) {
  return db.select({ id: maps.id }).from(maps).where(eq(maps.userId, authorId));
}

export function removeCoauthorshipsBetween(
  db: Database,
  [userId, otherId]: readonly [number, number]
) {
  const coauthoring = (coauthorId: number, authorId: number) =>
    and(
      eq(coauthorships.userId, coauthorId),
      inArray(coauthorships.mapId, mapIdsOf(db, authorId))
    );

  return db
    .delete(coauthorships)
    .where(or(coauthoring(userId, otherId), coauthoring(otherId, userId)));
}

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

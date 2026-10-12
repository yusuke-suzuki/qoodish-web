import type {
  GuestPin,
  GuestPinComment,
  Image,
  MapRef,
  Pin
} from '@qoodish/api-contract';
import { and, asc, eq, max, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import {
  type CommentRow,
  type CommentsOptions,
  commentBody,
  commentsQuery,
  guestComment,
  viewerComment
} from './comments.ts';
import {
  chunks,
  currentTimestamp,
  type Database,
  inIds,
  reviseUntilCurrent,
  scalar,
  uniqueIds,
  unrevisedRecord
} from './db/client.ts';
import {
  comments,
  images,
  maps,
  pinProperties,
  pinPropertyOptions,
  pinRevisionImages,
  pinRevisionPropertyOptions,
  pinRevisions,
  pins
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { MessageKey } from './i18n/index.ts';
import { image, sameIds, unownedImageErrors } from './images.ts';
import { first } from './routing.ts';
import { relation, type UserRow, userSummary, usersQuery } from './users.ts';
import { coordinate, id, imageIds, text } from './validation.ts';
import { referenceablePin, shownTo, type Viewer } from './visibility.ts';
import { type Likes, likesByVotable, likesQuery } from './votes.ts';

export type PinRow = typeof pins.$inferSelect;

export function referenceablePinQuery(
  db: Database,
  viewer: Viewer,
  pinId: number
) {
  return db
    .select()
    .from(pins)
    .where(and(referenceablePin(viewer), eq(pins.id, pinId)));
}

export async function referenceablePinOf(
  db: Database,
  viewer: Viewer,
  pinId: number
): Promise<PinRow> {
  return first(await referenceablePinQuery(db, viewer, pinId));
}

export type PinParts = {
  row: PinRow;
  author: UserRow;
  map: MapRef;
  images: Image[];
  propertyOptionIds: number[];
  likes: Likes;
  comments: CommentRow[];
};

export async function loadPins(
  db: Database,
  rows: readonly PinRow[],
  options: CommentsOptions
): Promise<PinParts[]> {
  if (rows.length === 0) {
    return [];
  }

  const pinIds = rows.map((row) => row.id);
  const revisionIds = uniqueIds(rows.map((row) => row.currentRevisionId));

  const [authors, mapRefs, revisionImages, propertyOptions, likes, comments] =
    await db.batch([
      usersQuery(db, uniqueIds(rows.map((row) => row.userId))),
      db
        .select({ id: maps.id, name: maps.name, private: maps.private })
        .from(maps)
        .where(inIds(maps.id, uniqueIds(rows.map((row) => row.mapId)))),
      db
        .select({
          revisionId: pinRevisionImages.pinRevisionId,
          id: images.id,
          url: images.url
        })
        .from(pinRevisionImages)
        .innerJoin(images, eq(images.id, pinRevisionImages.imageId))
        .where(inIds(pinRevisionImages.pinRevisionId, revisionIds))
        .orderBy(asc(images.id)),
      db
        .select({
          revisionId: pinRevisionPropertyOptions.pinRevisionId,
          optionId: pinRevisionPropertyOptions.pinPropertyOptionId
        })
        .from(pinRevisionPropertyOptions)
        .where(inIds(pinRevisionPropertyOptions.pinRevisionId, revisionIds))
        .orderBy(asc(pinRevisionPropertyOptions.pinPropertyOptionId)),
      likesQuery(db, 'Pin', pinIds, options.viewerId),
      commentsQuery(db, 'Pin', pinIds, options)
    ]);

  const authorsById = new Map<number, UserRow>(
    authors.map((author) => [author.id, author])
  );
  const mapsById = new Map(mapRefs.map((map) => [map.id, map]));
  const imagesByRevision = Map.groupBy(revisionImages, (row) => row.revisionId);
  const optionsByRevision = Map.groupBy(
    propertyOptions,
    (row) => row.revisionId
  );
  const likesOf = likesByVotable(likes);
  const commentsByPin = Map.groupBy(comments, (row) => row.commentableId);

  return rows.flatMap((row) => {
    const author = authorsById.get(row.userId);
    const map = mapsById.get(row.mapId);

    if (!author || !map) {
      return [];
    }

    const revision = row.currentRevisionId;

    return [
      {
        row,
        author,
        map: { id: map.id, name: map.name, private: map.private as boolean },
        images: (
          (revision === null ? undefined : imagesByRevision.get(revision)) ?? []
        ).map((revisionImage) => image(revisionImage.id, revisionImage.url)),
        propertyOptionIds: (
          (revision === null ? undefined : optionsByRevision.get(revision)) ??
          []
        ).map((option) => option.optionId),
        likes: likesOf(row.id),
        comments: commentsByPin.get(row.id) ?? []
      }
    ];
  });
}

export async function guestPins(
  db: Database,
  rows: readonly PinRow[]
): Promise<GuestPin[]> {
  const parts = await loadPins(db, rows, { visibleOnly: true });

  return parts.map(({ row, author, map, ...pin }) => ({
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    author: userSummary(author),
    comment: row.comment,
    comments: pin.comments.map(
      (comment): GuestPinComment => ({
        ...guestComment(comment),
        pin_id: row.id
      })
    ),
    images: pin.images,
    property_option_ids: pin.propertyOptionIds,
    map,
    likes_count: pin.likes.likes,
    created_at: row.createdAt,
    updated_at: row.updatedAt
  }));
}

export async function viewerPins(
  db: Database,
  viewer: Viewer,
  rows: readonly PinRow[]
): Promise<Pin[]> {
  const parts = await loadPins(db, rows, {
    visibleOnly: true,
    condition: shownTo(viewer, comments.userId),
    viewerId: viewer.id
  });

  return parts.map(({ row, author, map, ...pin }) => ({
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    author: { ...userSummary(author), ...relation(viewer, author.id) },
    comment: row.comment,
    comments: pin.comments.map((comment) => ({
      ...viewerComment(comment),
      pin_id: row.id
    })),
    images: pin.images,
    property_option_ids: pin.propertyOptionIds,
    map,
    editable: row.userId === viewer.id,
    liked: pin.likes.liked,
    likes_count: pin.likes.likes,
    created_at: row.createdAt,
    updated_at: row.updatedAt
  }));
}

const PIN_NAME_LIMIT = 100;
const PIN_IMAGE_LIMIT = 4;
const OPTIONS_PER_INSERT = 20;

type PinContent = {
  name: string;
  comment: string;
  latitude: number;
  longitude: number;
  status: 'published' | 'deleted';
};

type PinChoices = {
  imageIds: number[];
  propertyOptionIds: number[];
};

const pinName = text({
  required: 'pin_name_required',
  max: { length: PIN_NAME_LIMIT, error: 'pin_name_exceed' }
});

const pinCoordinate = coordinate('pin_location_required');

const pinChoices = {
  image_ids: imageIds({
    max: PIN_IMAGE_LIMIT,
    error: 'pin_images_exceed'
  }).optional(),
  property_option_ids: z
    .array(id)
    .transform((ids) => uniqueIds(ids))
    .optional()
};

function withChoices<
  Changes extends { image_ids?: number[]; property_option_ids?: number[] }
>({ image_ids, property_option_ids, ...changes }: Changes) {
  return {
    ...changes,
    imageIds: image_ids,
    propertyOptionIds: property_option_ids
  };
}

export const newPinInput = z
  .object({
    comment: commentBody,
    name: pinName,
    latitude: pinCoordinate,
    longitude: pinCoordinate,
    ...pinChoices
  })
  .transform(withChoices);

export const pinInput = z
  .object({
    comment: commentBody.optional(),
    name: pinName.optional(),
    latitude: pinCoordinate.optional(),
    longitude: pinCoordinate.optional(),
    ...pinChoices
  })
  .transform(withChoices);

async function propertyOptionErrors(
  db: Database,
  { optionIds, mapId }: { optionIds: readonly number[]; mapId: number }
): Promise<MessageKey[]> {
  if (optionIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({
      status: pinPropertyOptions.status,
      propertyId: pinProperties.id,
      propertyStatus: pinProperties.status,
      mapId: pinProperties.mapId,
      multiple: pinProperties.multiple
    })
    .from(pinPropertyOptions)
    .innerJoin(
      pinProperties,
      eq(pinProperties.id, pinPropertyOptions.pinPropertyId)
    )
    .where(inIds(pinPropertyOptions.id, optionIds));

  if (rows.length !== optionIds.length) {
    throw new ApiError('NotFound');
  }

  const singleChoices = rows
    .filter((row) => !row.multiple)
    .map((row) => row.propertyId);
  const usable =
    rows.every(
      (row) =>
        row.status === 'published' &&
        row.propertyStatus === 'published' &&
        row.mapId === mapId
    ) && new Set(singleChoices).size === singleChoices.length;

  return usable ? [] : ['pin_property_options_invalid'];
}

async function assertChoicesUsable(
  db: Database,
  {
    choices,
    editorId,
    mapId
  }: {
    choices: Partial<PinChoices>;
    editorId: number;
    mapId: number;
  }
): Promise<void> {
  const [imageErrors, optionErrors] = await Promise.all([
    unownedImageErrors(db, choices.imageIds ?? [], editorId),
    propertyOptionErrors(db, {
      optionIds: choices.propertyOptionIds ?? [],
      mapId
    })
  ]);
  const errors = [...imageErrors, ...optionErrors];

  if (errors.length > 0) {
    throw ApiError.invalid(errors);
  }
}

function newestPinOf(db: Database, userId: number): SQL<number> {
  return scalar(
    db
      .select({ id: max(pins.id).as('id') })
      .from(pins)
      .where(eq(pins.userId, userId))
  );
}

function pinRevisionStatements(
  db: Database,
  {
    pinId,
    editorId,
    content,
    choices,
    now
  }: {
    pinId: number | SQL;
    editorId: number;
    content: PinContent;
    choices: PinChoices;
    now: string;
  }
) {
  const revisionId = scalar(
    db
      .select({ id: max(pinRevisions.id).as('id') })
      .from(pinRevisions)
      .where(eq(pinRevisions.pinId, pinId))
  );

  return [
    db.insert(pinRevisions).values({
      ...content,
      pinId,
      userId: editorId,
      createdAt: now,
      updatedAt: now
    }),
    ...(choices.imageIds.length === 0
      ? []
      : [
          db.insert(pinRevisionImages).values(
            choices.imageIds.map((imageId) => ({
              pinRevisionId: revisionId,
              imageId,
              createdAt: now,
              updatedAt: now
            }))
          )
        ]),
    ...chunks(choices.propertyOptionIds, OPTIONS_PER_INSERT).map((optionIds) =>
      db.insert(pinRevisionPropertyOptions).values(
        optionIds.map((pinPropertyOptionId) => ({
          pinRevisionId: revisionId,
          pinPropertyOptionId,
          createdAt: now,
          updatedAt: now
        }))
      )
    ),
    db
      .update(pins)
      .set({ currentRevisionId: revisionId })
      .where(eq(pins.id, pinId))
  ] as const;
}

export async function createPin(
  db: Database,
  {
    mapId,
    userId,
    changes
  }: { mapId: number; userId: number; changes: z.output<typeof newPinInput> }
): Promise<PinRow> {
  const choices: PinChoices = {
    imageIds: changes.imageIds ?? [],
    propertyOptionIds: changes.propertyOptionIds ?? []
  };
  const content: PinContent = {
    name: changes.name,
    comment: changes.comment,
    latitude: changes.latitude,
    longitude: changes.longitude,
    status: 'published'
  };

  await assertChoicesUsable(db, { choices, editorId: userId, mapId });

  const now = currentTimestamp();
  const pinId = newestPinOf(db, userId);
  const results = await db.batch([
    db
      .insert(pins)
      .values({ ...content, mapId, userId, createdAt: now, updatedAt: now }),
    ...pinRevisionStatements(db, {
      pinId,
      editorId: userId,
      content,
      choices,
      now
    }),
    db.select().from(pins).where(eq(pins.id, pinId))
  ]);

  return first(results[results.length - 1] as PinRow[]);
}

async function currentPinChoices(
  db: Database,
  pin: PinRow
): Promise<PinChoices> {
  if (pin.currentRevisionId === null) {
    return { imageIds: [], propertyOptionIds: [] };
  }

  const [imageRows, optionRows] = await db.batch([
    db
      .select({ id: pinRevisionImages.imageId })
      .from(pinRevisionImages)
      .where(eq(pinRevisionImages.pinRevisionId, pin.currentRevisionId))
      .orderBy(asc(pinRevisionImages.imageId)),
    db
      .select({ id: pinRevisionPropertyOptions.pinPropertyOptionId })
      .from(pinRevisionPropertyOptions)
      .where(
        eq(pinRevisionPropertyOptions.pinRevisionId, pin.currentRevisionId)
      )
      .orderBy(asc(pinRevisionPropertyOptions.pinPropertyOptionId))
  ]);

  return {
    imageIds: imageRows.map((row) => row.id),
    propertyOptionIds: optionRows.map((row) => row.id)
  };
}

function currentPinContent(pin: PinRow): PinContent {
  return {
    name: pin.name,
    comment: pin.comment,
    latitude: pin.latitude,
    longitude: pin.longitude,
    status: pin.status === 'deleted' ? 'deleted' : 'published'
  };
}

async function writePinRevision(
  db: Database,
  pin: PinRow,
  {
    editorId,
    content,
    submitted
  }: {
    editorId: number;
    content: PinContent;
    submitted: Partial<PinChoices>;
  }
): Promise<void> {
  const current = currentPinContent(pin);
  const carried = await currentPinChoices(db, pin);
  const choices: PinChoices = {
    imageIds: submitted.imageIds ?? carried.imageIds,
    propertyOptionIds: submitted.propertyOptionIds ?? carried.propertyOptionIds
  };
  const changed = (Object.keys(content) as (keyof PinContent)[]).some(
    (key) => content[key] !== current[key]
  );

  if (
    !changed &&
    sameIds(choices.imageIds, carried.imageIds) &&
    sameIds(choices.propertyOptionIds, carried.propertyOptionIds)
  ) {
    return;
  }

  await assertChoicesUsable(db, {
    choices: submitted,
    editorId,
    mapId: pin.mapId
  });

  const now = currentTimestamp();

  await db.batch([
    db
      .update(pins)
      .set({ ...content, updatedAt: now })
      .where(eq(pins.id, pin.id)),
    ...pinRevisionStatements(db, {
      pinId: unrevisedRecord(db, pins, pin),
      editorId,
      content,
      choices,
      now
    })
  ]);
}

export function revisePin(
  db: Database,
  read: () => Promise<PinRow>,
  {
    editorId,
    changes
  }: { editorId: number; changes: z.output<typeof pinInput> }
): Promise<void> {
  return reviseUntilCurrent(pinRevisions.pinId, async () => {
    const pin = await read();
    const current = currentPinContent(pin);

    await writePinRevision(db, pin, {
      editorId,
      content: {
        ...current,
        name: changes.name ?? current.name,
        comment: changes.comment ?? current.comment,
        latitude: changes.latitude ?? current.latitude,
        longitude: changes.longitude ?? current.longitude
      },
      submitted: {
        imageIds: changes.imageIds,
        propertyOptionIds: changes.propertyOptionIds
      }
    });
  });
}

export function discardPin(
  db: Database,
  read: () => Promise<PinRow>,
  editorId: number
): Promise<void> {
  return reviseUntilCurrent(pinRevisions.pinId, async () => {
    const pin = await read();

    await writePinRevision(db, pin, {
      editorId,
      content: { ...currentPinContent(pin), status: 'deleted' },
      submitted: {}
    });
  });
}

import type {
  Journey,
  JourneyCheckin,
  JourneySummary,
  MapRef,
  Milestone
} from '@qoodish/api-contract';
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  max,
  ne,
  notExists,
  type SQL,
  type SQLWrapper,
  sql
} from 'drizzle-orm';
import { QueryBuilder } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import { detachJourneys } from './chapters.ts';
import {
  chunks,
  constraintViolated,
  currentTimestamp,
  type Database,
  generatedId,
  reviseUntilCurrent,
  scalar,
  selected,
  unrevisedRecord
} from './db/client.ts';
import {
  chapters,
  images,
  journeyCheckinRevisionImages,
  journeyCheckinRevisions,
  journeyCheckins,
  journeys,
  maps,
  milestones
} from './db/schema.ts';
import {
  decryptAttribute,
  type EncryptionSecrets,
  encryptAttribute
} from './encryption.ts';
import { ApiError } from './errors.ts';
import type { MessageKey } from './i18n/index.ts';
import {
  image,
  imageOwnersQuery,
  sameIds,
  unownedImageErrors,
  unownedImages
} from './images.ts';
import { type PinRow, referenceablePinQuery } from './pins.ts';
import { first, present } from './routing.ts';
import { characters, withoutCarriageReturns } from './text.ts';
import { parseTimestamp } from './timestamps.ts';
import { imageIds, optionalId } from './validation.ts';
import type { Viewer } from './visibility.ts';

const ENCODED_PATH_LIMIT = 1_000_000;
const CHECKIN_NOTE_LIMIT = 500;
const CHECKIN_IMAGE_LIMIT = 4;
const IMAGES_PER_INSERT = 10;

const qb = new QueryBuilder();

export type JourneyRecord = typeof journeys.$inferSelect;

export type JourneyOwner = { userId: number; journeyId: number };

type CheckinRow = typeof journeyCheckins.$inferSelect;

type CheckinContent = {
  note: string | null;
  checkedInAt: string;
  status: 'recorded' | 'deleted';
};

type RevisionImage = { revisionId: number; id: number; url: string };

const journeyColumns = {
  id: journeys.id,
  mapId: journeys.mapId,
  startedAt: journeys.startedAt,
  finishedAt: journeys.finishedAt,
  encodedPath: journeys.encodedPath,
  createdAt: journeys.createdAt,
  updatedAt: journeys.updatedAt,
  chapterId: sql<number | null>`${qb
    .select({ id: chapters.id })
    .from(chapters)
    .where(eq(chapters.journeyId, journeys.id))
    .orderBy(asc(chapters.id))
    .limit(1)}`.as('chapter_id'),
  mapName: maps.name,
  mapPrivate: maps.private
};

function journeysQuery(db: Database, condition: SQL | undefined) {
  return db
    .select(journeyColumns)
    .from(journeys)
    .leftJoin(maps, eq(maps.id, journeys.mapId))
    .where(condition);
}

type JourneyRow = Awaited<ReturnType<typeof journeysQuery>>[number];

function mapRef(row: JourneyRow): MapRef | null {
  return row.mapId === null || row.mapName === null
    ? null
    : { id: row.mapId, name: row.mapName, private: row.mapPrivate as boolean };
}

const recorded = ne(journeyCheckins.status, 'deleted');

function milestoneOf(milestone: typeof milestones.$inferSelect): Milestone {
  return {
    id: milestone.id,
    pin_id: milestone.pinId,
    name: milestone.name,
    latitude: milestone.latitude,
    longitude: milestone.longitude
  };
}

function checkinImagesQuery(db: Database, revisionIds: SQLWrapper) {
  return db
    .select({
      revisionId: journeyCheckinRevisionImages.journeyCheckinRevisionId,
      id: images.id,
      url: images.url
    })
    .from(journeyCheckinRevisionImages)
    .innerJoin(images, eq(images.id, journeyCheckinRevisionImages.imageId))
    .where(
      inArray(
        journeyCheckinRevisionImages.journeyCheckinRevisionId,
        revisionIds
      )
    )
    .orderBy(asc(images.id));
}

function checkinOf(
  checkin: CheckinRow,
  imagesByRevision: Map<number, RevisionImage[]>
): JourneyCheckin {
  return {
    id: checkin.id,
    pin_id: checkin.pinId,
    spot: {
      name: checkin.name,
      latitude: checkin.latitude,
      longitude: checkin.longitude
    },
    note: checkin.note,
    images: (
      (checkin.currentRevisionId === null
        ? undefined
        : imagesByRevision.get(checkin.currentRevisionId)) ?? []
    ).map((item) => image(item.id, item.url)),
    checked_in_at: checkin.checkedInAt
  };
}

function currentRevisionsOf(db: Database, condition: SQL | undefined) {
  return db
    .select({ id: journeyCheckins.currentRevisionId })
    .from(journeyCheckins)
    .where(condition);
}

export async function journeySummaries(
  db: Database,
  userId: number
): Promise<JourneySummary[]> {
  const rows = await db
    .select({
      ...journeyColumns,
      milestonesCount: db
        .$count(milestones, eq(milestones.journeyId, journeys.id))
        .as('milestones_count'),
      checkinsCount: db
        .$count(
          journeyCheckins,
          and(eq(journeyCheckins.journeyId, journeys.id), recorded)
        )
        .as('checkins_count')
    })
    .from(journeys)
    .leftJoin(maps, eq(maps.id, journeys.mapId))
    .where(eq(journeys.userId, userId))
    .orderBy(desc(journeys.createdAt), asc(journeys.id));

  return rows.map((row) => ({
    id: row.id,
    map_id: row.mapId,
    started_at: row.startedAt,
    finished_at: row.finishedAt,
    milestones_count: row.milestonesCount,
    checkins_count: row.checkinsCount,
    chapter_id: row.chapterId,
    map: mapRef(row),
    created_at: row.createdAt,
    updated_at: row.updatedAt
  }));
}

export async function journeyDetail(
  db: Database,
  condition: SQL | undefined,
  secrets: EncryptionSecrets
): Promise<Journey> {
  const row = first(await journeysQuery(db, condition));
  const recordedCheckins = and(eq(journeyCheckins.journeyId, row.id), recorded);
  const [milestoneRows, checkinRows, checkinImages] = await db.batch([
    db
      .select()
      .from(milestones)
      .where(eq(milestones.journeyId, row.id))
      .orderBy(asc(milestones.position)),
    db
      .select()
      .from(journeyCheckins)
      .where(recordedCheckins)
      .orderBy(asc(journeyCheckins.checkedInAt), asc(journeyCheckins.id)),
    checkinImagesQuery(db, currentRevisionsOf(db, recordedCheckins))
  ]);
  const imagesByRevision = Map.groupBy(
    checkinImages,
    (item) => item.revisionId
  );

  return {
    id: row.id,
    map_id: row.mapId,
    started_at: row.startedAt,
    finished_at: row.finishedAt,
    milestones: milestoneRows.map(milestoneOf),
    checkins: checkinRows.map((checkin) =>
      checkinOf(checkin, imagesByRevision)
    ),
    encoded_path:
      row.encodedPath === null
        ? null
        : await decryptAttribute(row.encodedPath, secrets),
    chapter_id: row.chapterId,
    map: mapRef(row),
    created_at: row.createdAt,
    updated_at: row.updatedAt
  };
}

export async function journeyCheckin(
  db: Database,
  checkinId: number
): Promise<JourneyCheckin> {
  const condition = eq(journeyCheckins.id, checkinId);
  const [rows, checkinImages] = await db.batch([
    db.select().from(journeyCheckins).where(condition),
    checkinImagesQuery(db, currentRevisionsOf(db, condition))
  ]);

  return checkinOf(
    first(rows),
    Map.groupBy(checkinImages, (item) => item.revisionId)
  );
}

const pinId = z
  .union([z.number(), z.string()])
  .optional()
  .transform(optionalId);

const checkinFields = {
  note: z
    .string()
    .overwrite(withoutCarriageReturns)
    .refine((value) => characters(value) <= CHECKIN_NOTE_LIMIT, {
      error: 'checkin_note_exceeded'
    })
    .nullable()
    .optional(),
  checked_in_at: z
    .string()
    .nullable()
    .optional()
    .transform((value) =>
      typeof value === 'string' ? parseTimestamp(value) : value
    ),
  image_ids: imageIds({
    max: CHECKIN_IMAGE_LIMIT,
    error: 'images_per_checkin_reached_limit'
  }).optional()
};

export const milestoneInput = z.object({ pin_id: pinId });

export const newCheckinInput = z.object({ pin_id: pinId, ...checkinFields });

export const checkinInput = z.object(checkinFields);

export const finishInput = z.object({
  encoded_path: z
    .string()
    .refine((value) => characters(value) <= ENCODED_PATH_LIMIT, {
      error: 'journey_encoded_path_exceed'
    })
    .nullish()
});

function unfinishedJourneyOf(userId: number, mapId: SQLWrapper) {
  return qb
    .select({ id: journeys.id })
    .from(journeys)
    .where(
      and(
        eq(journeys.userId, userId),
        eq(journeys.mapId, mapId),
        isNull(journeys.finishedAt)
      )
    );
}

export async function createJourney(
  db: Database,
  { userId, mapId }: { userId: number; mapId: number }
): Promise<number> {
  const now = currentTimestamp();
  const [created] = await db
    .insert(journeys)
    .select(
      db
        .select({
          id: generatedId(),
          createdAt: selected(now, 'created_at'),
          encodedPath: sql<string | null>`NULL`.as('encoded_path'),
          finishedAt: sql<string | null>`NULL`.as('finished_at'),
          mapId: maps.id,
          startedAt: sql<string | null>`NULL`.as('started_at'),
          updatedAt: selected(now, 'updated_at'),
          userId: selected(userId, 'user_id')
        })
        .from(maps)
        .where(
          and(
            eq(maps.id, mapId),
            notExists(unfinishedJourneyOf(userId, maps.id))
          )
        )
    )
    .returning({ id: journeys.id });

  if (!created) {
    throw ApiError.invalid(['duplicate_unfinished_journey']);
  }

  return created.id;
}

export function ownedJourney(
  { userId, journeyId }: JourneyOwner,
  condition?: SQL
): SQL | undefined {
  return and(
    eq(journeys.id, journeyId),
    eq(journeys.userId, userId),
    condition
  );
}

function ownedJourneyQuery(db: Database, owner: JourneyOwner, condition?: SQL) {
  return db.select().from(journeys).where(ownedJourney(owner, condition));
}

export async function ownJourney(
  db: Database,
  owner: JourneyOwner,
  condition?: SQL
): Promise<JourneyRecord> {
  return first(await ownedJourneyQuery(db, owner, condition));
}

const unfinishedJourney = isNull(journeys.finishedAt);

export async function startJourney(
  db: Database,
  owner: JourneyOwner
): Promise<void> {
  const unfinished = ownedJourney(owner, unfinishedJourney);
  const now = currentTimestamp();
  const [[journey]] = await db.batch([
    db
      .select({ startedAt: journeys.startedAt })
      .from(journeys)
      .where(unfinished),
    db
      .update(journeys)
      .set({ startedAt: now, updatedAt: now })
      .where(and(unfinished, isNull(journeys.startedAt)))
  ]);

  if (!journey) {
    throw new ApiError('NotFound');
  }

  if (journey.startedAt !== null) {
    throw new ApiError('Conflict', undefined, ['journey_already_started']);
  }
}

export async function finishJourney(
  db: Database,
  owner: JourneyOwner,
  {
    encodedPath,
    secrets
  }: { encodedPath: string | null | undefined; secrets: EncryptionSecrets }
): Promise<void> {
  const journey = await ownJourney(db, owner, unfinishedJourney);

  if (journey.startedAt === null) {
    throw new ApiError('Conflict', undefined, ['journey_not_started']);
  }

  const encrypted =
    encodedPath !== null && present(encodedPath)
      ? await encryptAttribute(encodedPath, secrets)
      : undefined;
  const now = currentTimestamp();
  const finished = await db
    .update(journeys)
    .set({
      finishedAt: now,
      updatedAt: now,
      ...(encrypted === undefined ? {} : { encodedPath: encrypted })
    })
    .where(
      and(ownedJourney(owner, unfinishedJourney), isNotNull(journeys.startedAt))
    )
    .returning({ id: journeys.id });

  first(finished);
}

export function journeyDependentsDeletion(
  db: Database,
  journeyIds: SQLWrapper
) {
  const checkinIds = db
    .select({ id: journeyCheckins.id })
    .from(journeyCheckins)
    .where(inArray(journeyCheckins.journeyId, journeyIds));
  const revisionIds = db
    .select({ id: journeyCheckinRevisions.id })
    .from(journeyCheckinRevisions)
    .where(inArray(journeyCheckinRevisions.journeyCheckinId, checkinIds));

  return [
    db
      .delete(journeyCheckinRevisionImages)
      .where(
        inArray(
          journeyCheckinRevisionImages.journeyCheckinRevisionId,
          revisionIds
        )
      ),
    db
      .delete(journeyCheckinRevisions)
      .where(inArray(journeyCheckinRevisions.journeyCheckinId, checkinIds)),
    db
      .delete(journeyCheckins)
      .where(inArray(journeyCheckins.journeyId, journeyIds)),
    db.delete(milestones).where(inArray(milestones.journeyId, journeyIds)),
    detachJourneys(db, journeyIds)
  ] as const;
}

export function checkinRevisionImagesOfImagesDeletion(
  db: Database,
  imageIds: SQLWrapper
) {
  return db
    .delete(journeyCheckinRevisionImages)
    .where(inArray(journeyCheckinRevisionImages.imageId, imageIds));
}

export function journeysDeletion(db: Database, journeyIds: SQLWrapper) {
  return db.delete(journeys).where(inArray(journeys.id, journeyIds));
}

export function detachJourneysFromPins(db: Database, pinIds: SQLWrapper) {
  return [
    db
      .update(milestones)
      .set({ pinId: null })
      .where(inArray(milestones.pinId, pinIds)),
    db
      .update(journeyCheckins)
      .set({ pinId: null })
      .where(inArray(journeyCheckins.pinId, pinIds))
  ] as const;
}

export function detachJourneysFromMaps(db: Database, mapIds: SQLWrapper) {
  return db
    .update(journeys)
    .set({ mapId: null })
    .where(inArray(journeys.mapId, mapIds));
}

export async function destroyJourney(
  db: Database,
  owner: JourneyOwner
): Promise<void> {
  const journeyIds = db
    .select({ id: journeys.id })
    .from(journeys)
    .where(ownedJourney(owner));
  const results = await db.batch([
    ...journeyDependentsDeletion(db, journeyIds),
    db
      .delete(journeys)
      .where(ownedJourney(owner))
      .returning({ id: journeys.id })
  ]);

  first(results[results.length - 1] as { id: number }[]);
}

function pinErrors(journey: JourneyRecord, pin: PinRow): MessageKey[] {
  return pin.mapId === journey.mapId ? [] : ['pin_not_on_journey_map'];
}

function assertValid(errors: readonly MessageKey[]): void {
  if (errors.length > 0) {
    throw ApiError.invalid(errors);
  }
}

export async function addMilestone(
  db: Database,
  viewer: Viewer,
  { owner, pinId }: { owner: JourneyOwner; pinId: number | undefined }
): Promise<Milestone> {
  if (pinId === undefined) {
    throw new ApiError('NotFound');
  }

  const [[journey], [pin]] = await db.batch([
    ownedJourneyQuery(db, owner, unfinishedJourney),
    referenceablePinQuery(db, viewer, pinId)
  ]);

  if (!journey || !pin) {
    throw new ApiError('NotFound');
  }

  assertValid(pinErrors(journey, pin));

  const now = currentTimestamp();
  const [added] = await db
    .insert(milestones)
    .select(
      db
        .select({
          id: generatedId(),
          createdAt: selected(now, 'created_at'),
          journeyId: journeys.id,
          latitude: selected(pin.latitude, 'latitude'),
          longitude: selected(pin.longitude, 'longitude'),
          name: selected(pin.name, 'name'),
          pinId: selected(pin.id, 'pin_id'),
          position: sql<number>`${scalar(
            qb
              .select({
                position:
                  sql<number>`coalesce(max(${milestones.position}), 0) + 1`.as(
                    'position'
                  )
              })
              .from(milestones)
              .where(eq(milestones.journeyId, journey.id))
          )}`.as('position'),
          updatedAt: selected(now, 'updated_at')
        })
        .from(journeys)
        .where(and(eq(journeys.id, journey.id), unfinishedJourney))
    )
    .onConflictDoNothing()
    .returning();

  if (!added) {
    const [duplicate] = await db
      .select({ id: milestones.id })
      .from(milestones)
      .where(
        and(eq(milestones.journeyId, journey.id), eq(milestones.pinId, pin.id))
      )
      .limit(1);

    throw ApiError.invalid([
      duplicate ? 'duplicate_milestone' : 'journey_already_finished'
    ]);
  }

  return milestoneOf(added);
}

export async function removeMilestone(
  db: Database,
  {
    userId,
    journeyId,
    milestoneId
  }: { userId: number; journeyId: number; milestoneId: number }
): Promise<void> {
  const removed = await db
    .delete(milestones)
    .where(
      and(
        eq(milestones.id, milestoneId),
        inArray(
          milestones.journeyId,
          db
            .select({ id: journeys.id })
            .from(journeys)
            .where(ownedJourney({ userId, journeyId }, unfinishedJourney))
        )
      )
    )
    .returning({ id: milestones.id });

  first(removed);
}

function periodErrors(
  journey: JourneyRecord,
  checkedInAt: string | null
): MessageKey[] {
  if (journey.startedAt === null) {
    return ['journey_not_started'];
  }

  const upperBound = journey.finishedAt ?? currentTimestamp();

  return checkedInAt !== null &&
    checkedInAt >= journey.startedAt &&
    checkedInAt <= upperBound
    ? []
    : ['checkin_time_outside_journey_period'];
}

function assertWithinPeriod(
  journey: JourneyRecord,
  checkedInAt: string | null
): asserts checkedInAt is string {
  assertValid(periodErrors(journey, checkedInAt));
}

function checkinRevisionStatements(
  db: Database,
  {
    checkinId,
    editorId,
    content,
    imageIds,
    now
  }: {
    checkinId: number | SQL;
    editorId: number;
    content: CheckinContent;
    imageIds: readonly number[];
    now: string;
  }
) {
  const revisionId = scalar(
    db
      .select({ id: max(journeyCheckinRevisions.id).as('id') })
      .from(journeyCheckinRevisions)
      .where(eq(journeyCheckinRevisions.journeyCheckinId, checkinId))
  );

  return [
    db.insert(journeyCheckinRevisions).values({
      ...content,
      journeyCheckinId: checkinId,
      userId: editorId,
      createdAt: now,
      updatedAt: now
    }),
    ...chunks(imageIds, IMAGES_PER_INSERT).map((ids) =>
      db.insert(journeyCheckinRevisionImages).values(
        ids.map((imageId) => ({
          journeyCheckinRevisionId: revisionId,
          imageId,
          createdAt: now,
          updatedAt: now
        }))
      )
    ),
    db
      .update(journeyCheckins)
      .set({ currentRevisionId: revisionId })
      .where(eq(journeyCheckins.id, checkinId))
  ] as const;
}

export async function recordCheckin(
  db: Database,
  viewer: Viewer,
  {
    owner,
    changes
  }: { owner: JourneyOwner; changes: z.output<typeof newCheckinInput> }
): Promise<number> {
  const pinId = changes.pin_id;

  if (pinId === undefined) {
    throw new ApiError('NotFound');
  }

  const imageIds = changes.image_ids ?? [];
  const [[journey], [pin], [duplicate], imageOwners] = await db.batch([
    ownedJourneyQuery(db, owner),
    referenceablePinQuery(db, viewer, pinId),
    db
      .select({ id: journeyCheckins.id })
      .from(journeyCheckins)
      .where(
        and(
          eq(journeyCheckins.journeyId, owner.journeyId),
          eq(journeyCheckins.pinId, pinId)
        )
      )
      .limit(1),
    imageOwnersQuery(db, imageIds)
  ]);

  if (!journey || !pin) {
    throw new ApiError('NotFound');
  }

  const now = currentTimestamp();
  const checkedInAt = changes.checked_in_at ?? now;
  const editorId = viewer.id;

  assertValid([
    ...pinErrors(journey, pin),
    ...(duplicate ? (['duplicate_checkin'] as const) : []),
    ...periodErrors(journey, checkedInAt)
  ]);
  assertValid(unownedImages(imageOwners, imageIds, editorId));

  const content: CheckinContent = {
    note: changes.note ?? null,
    checkedInAt,
    status: 'recorded'
  };
  const checkinId = scalar(
    db
      .select({ id: max(journeyCheckins.id).as('id') })
      .from(journeyCheckins)
      .where(eq(journeyCheckins.journeyId, journey.id))
  );

  try {
    const [inserted] = await db.batch([
      db
        .insert(journeyCheckins)
        .values({
          ...content,
          journeyId: journey.id,
          pinId: pin.id,
          name: pin.name,
          latitude: pin.latitude,
          longitude: pin.longitude,
          createdAt: now,
          updatedAt: now
        })
        .returning({ id: journeyCheckins.id }),
      ...checkinRevisionStatements(db, {
        checkinId,
        editorId,
        content,
        imageIds,
        now
      })
    ]);

    return first(inserted).id;
  } catch (error) {
    if (
      constraintViolated(
        error,
        'UNIQUE',
        journeyCheckins.journeyId,
        journeyCheckins.pinId
      )
    ) {
      throw ApiError.invalid(['duplicate_checkin']);
    }

    throw error;
  }
}

export async function recordedCheckin(
  db: Database,
  { journeyId, checkinId }: { journeyId: number; checkinId: number }
): Promise<CheckinRow> {
  return first(
    await db
      .select()
      .from(journeyCheckins)
      .where(
        and(
          eq(journeyCheckins.id, checkinId),
          eq(journeyCheckins.journeyId, journeyId),
          recorded
        )
      )
  );
}

async function currentCheckinImageIds(
  db: Database,
  checkin: CheckinRow
): Promise<number[]> {
  if (checkin.currentRevisionId === null) {
    return [];
  }

  const rows = await db
    .select({ id: journeyCheckinRevisionImages.imageId })
    .from(journeyCheckinRevisionImages)
    .where(
      eq(
        journeyCheckinRevisionImages.journeyCheckinRevisionId,
        checkin.currentRevisionId
      )
    )
    .orderBy(asc(journeyCheckinRevisionImages.imageId));

  return rows.map((row) => row.id);
}

function currentCheckinContent(checkin: CheckinRow): CheckinContent {
  return {
    note: checkin.note,
    checkedInAt: checkin.checkedInAt,
    status: checkin.status === 'deleted' ? 'deleted' : 'recorded'
  };
}

async function writeCheckinRevision(
  db: Database,
  checkin: CheckinRow,
  {
    editorId,
    content,
    submitted
  }: {
    editorId: number;
    content: CheckinContent;
    submitted?: number[];
  }
): Promise<void> {
  const current = currentCheckinContent(checkin);
  const carried = await currentCheckinImageIds(db, checkin);
  const imageIds = submitted ?? carried;
  const changed = (Object.keys(content) as (keyof CheckinContent)[]).some(
    (key) => content[key] !== current[key]
  );

  if (!changed && sameIds(imageIds, carried)) {
    return;
  }

  assertValid(await unownedImageErrors(db, submitted ?? [], editorId));

  const now = currentTimestamp();

  await db.batch([
    db
      .update(journeyCheckins)
      .set({
        ...content,
        ...(content.status === 'deleted' ? { pinId: null } : {}),
        updatedAt: now
      })
      .where(eq(journeyCheckins.id, checkin.id)),
    ...checkinRevisionStatements(db, {
      checkinId: unrevisedRecord(db, journeyCheckins, checkin),
      editorId,
      content,
      imageIds,
      now
    })
  ]);
}

export function reviseCheckin(
  db: Database,
  read: () => Promise<CheckinRow>,
  {
    journey,
    editorId,
    changes
  }: {
    journey: JourneyRecord;
    editorId: number;
    changes: z.output<typeof checkinInput>;
  }
): Promise<void> {
  return reviseUntilCurrent(
    journeyCheckinRevisions.journeyCheckinId,
    async () => {
      const checkin = await read();
      const current = currentCheckinContent(checkin);
      const checkedInAt =
        changes.checked_in_at === undefined
          ? current.checkedInAt
          : changes.checked_in_at;

      if (checkedInAt !== current.checkedInAt) {
        assertWithinPeriod(journey, checkedInAt);
      }

      await writeCheckinRevision(db, checkin, {
        editorId,
        content: {
          ...current,
          note: changes.note === undefined ? current.note : changes.note,
          checkedInAt
        },
        submitted: changes.image_ids
      });
    }
  );
}

export function discardCheckin(
  db: Database,
  read: () => Promise<CheckinRow>,
  editorId: number
): Promise<void> {
  return reviseUntilCurrent(
    journeyCheckinRevisions.journeyCheckinId,
    async () => {
      const checkin = await read();

      await writeCheckinRevision(db, checkin, {
        editorId,
        content: { ...currentCheckinContent(checkin), status: 'deleted' }
      });
    }
  );
}

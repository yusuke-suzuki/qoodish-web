import type {
  Journey,
  JourneyCheckin,
  JourneySummary,
  MapRef
} from '@qoodish/api-contract';
import { and, asc, desc, eq, inArray, ne, type SQL, sql } from 'drizzle-orm';
import { QueryBuilder } from 'drizzle-orm/sqlite-core';
import type { Database } from './db/client.ts';
import {
  chapters,
  images,
  journeyCheckinRevisionImages,
  journeyCheckins,
  journeys,
  maps,
  milestones
} from './db/schema.ts';
import { decryptAttribute, type EncryptionSecrets } from './encryption.ts';
import { image } from './images.ts';

const qb = new QueryBuilder();

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
): Promise<Journey | null> {
  const [row] = await journeysQuery(db, condition);

  if (!row) {
    return null;
  }

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
    db
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
          db
            .select({ id: journeyCheckins.currentRevisionId })
            .from(journeyCheckins)
            .where(recordedCheckins)
        )
      )
      .orderBy(asc(images.id))
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
    milestones: milestoneRows.map((milestone) => ({
      id: milestone.id,
      pin_id: milestone.pinId,
      name: milestone.name,
      latitude: milestone.latitude,
      longitude: milestone.longitude
    })),
    checkins: checkinRows.map(
      (checkin): JourneyCheckin => ({
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
      })
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

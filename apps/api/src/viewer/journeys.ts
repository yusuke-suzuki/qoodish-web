import type {
  Journey,
  JourneyCheckin,
  JourneySummary,
  MapRef
} from '@qoodish/api-contract';
import { and, asc, desc, eq, ne, type SQL, sql } from 'drizzle-orm';
import { type Database, inIds, uniqueIds } from '../db/client.ts';
import {
  chapters,
  images,
  journeyCheckinRevisionImages,
  journeyCheckins,
  journeys,
  maps,
  milestones
} from '../db/schema.ts';
import { decryptAttribute, type EncryptionSecrets } from '../encryption.ts';
import { image } from '../images.ts';

const journeyColumns = {
  id: journeys.id,
  mapId: journeys.mapId,
  startedAt: journeys.startedAt,
  finishedAt: journeys.finishedAt,
  encodedPath: journeys.encodedPath,
  createdAt: journeys.createdAt,
  updatedAt: journeys.updatedAt,
  chapterId: sql<
    number | null
  >`(SELECT ${chapters.id} FROM ${chapters} WHERE ${chapters.journeyId} = ${journeys.id} ORDER BY ${chapters.id} LIMIT 1)`.as(
    'chapter_id'
  ),
  mapName: maps.name,
  mapPrivate: maps.private
};

type JourneyRow = {
  id: number;
  mapId: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  chapterId: number | null;
  mapName: string | null;
  mapPrivate: boolean | null;
};

function journeysQuery(db: Database, condition: SQL) {
  return db
    .select(journeyColumns)
    .from(journeys)
    .leftJoin(maps, eq(maps.id, journeys.mapId))
    .where(condition);
}

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
  const rows = await journeysQuery(db, eq(journeys.userId, userId)).orderBy(
    desc(journeys.createdAt),
    asc(journeys.id)
  );

  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row.id);
  const [milestoneCounts, checkinCounts] = await db.batch([
    db
      .select({ journeyId: milestones.journeyId, count: sql<number>`count(*)` })
      .from(milestones)
      .where(inIds(milestones.journeyId, ids))
      .groupBy(milestones.journeyId),
    db
      .select({
        journeyId: journeyCheckins.journeyId,
        count: sql<number>`count(*)`
      })
      .from(journeyCheckins)
      .where(and(inIds(journeyCheckins.journeyId, ids), recorded))
      .groupBy(journeyCheckins.journeyId)
  ]);
  const countsOf = (counts: { journeyId: number; count: number }[]) =>
    new Map(counts.map((row) => [row.journeyId, row.count]));
  const milestonesByJourney = countsOf(milestoneCounts);
  const checkinsByJourney = countsOf(checkinCounts);

  return rows.map((row) => ({
    id: row.id,
    map_id: row.mapId,
    started_at: row.startedAt,
    finished_at: row.finishedAt,
    milestones_count: milestonesByJourney.get(row.id) ?? 0,
    checkins_count: checkinsByJourney.get(row.id) ?? 0,
    chapter_id: row.chapterId,
    map: mapRef(row),
    created_at: row.createdAt,
    updated_at: row.updatedAt
  }));
}

export async function journeyDetail(
  db: Database,
  condition: SQL,
  secrets: EncryptionSecrets
): Promise<Journey | null> {
  const [row] = await journeysQuery(db, condition);

  if (!row) {
    return null;
  }

  const [milestoneRows, checkinRows] = await db.batch([
    db
      .select()
      .from(milestones)
      .where(eq(milestones.journeyId, row.id))
      .orderBy(asc(milestones.position)),
    db
      .select()
      .from(journeyCheckins)
      .where(and(eq(journeyCheckins.journeyId, row.id), recorded))
      .orderBy(asc(journeyCheckins.checkedInAt), asc(journeyCheckins.id))
  ]);
  const revisionIds = uniqueIds(
    checkinRows.map((checkin) => checkin.currentRevisionId)
  );
  const checkinImages =
    revisionIds.length === 0
      ? []
      : await db
          .select({
            revisionId: journeyCheckinRevisionImages.journeyCheckinRevisionId,
            id: images.id,
            url: images.url
          })
          .from(journeyCheckinRevisionImages)
          .innerJoin(
            images,
            eq(images.id, journeyCheckinRevisionImages.imageId)
          )
          .where(
            inIds(
              journeyCheckinRevisionImages.journeyCheckinRevisionId,
              revisionIds
            )
          )
          .orderBy(asc(images.id));
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

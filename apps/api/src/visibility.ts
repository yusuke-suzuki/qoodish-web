import {
  and,
  eq,
  inArray,
  ne,
  not,
  notInArray,
  or,
  type SQL,
  type SQLWrapper,
  sql
} from 'drizzle-orm';
import { QueryBuilder } from 'drizzle-orm/sqlite-core';
import { inIds } from './db/client.ts';
import {
  bookmarks,
  chapters,
  coauthorships,
  maps,
  moderationDecisions,
  pins
} from './db/schema.ts';

export type ModeratableType = 'Map' | 'Pin' | 'Chapter' | 'Comment';

export type Viewer = {
  id: number;
  blocking: ReadonlySet<number>;
  blockedBy: ReadonlySet<number>;
  muting: ReadonlySet<number>;
};

export function notBlocking(viewer: Viewer, userId: SQLWrapper): SQL {
  return not(inIds(userId, [...viewer.blockedBy]));
}

export function notBlockedBy(viewer: Viewer, userId: SQLWrapper): SQL {
  return not(inIds(userId, [...viewer.blocking]));
}

export function notMutedBy(viewer: Viewer, userId: SQLWrapper): SQL {
  return not(inIds(userId, [...viewer.muting]));
}

export function shownTo(viewer: Viewer, userId: SQLWrapper): SQL | undefined {
  return and(
    notBlocking(viewer, userId),
    notBlockedBy(viewer, userId),
    notMutedBy(viewer, userId)
  );
}

const qb = new QueryBuilder();

function removedIds(type: ModeratableType) {
  const latest = qb
    .select({
      moderatableId: moderationDecisions.moderatableId,
      outcome: moderationDecisions.outcome,
      ordinal:
        sql<number>`row_number() OVER (PARTITION BY ${moderationDecisions.moderatableId} ORDER BY ${moderationDecisions.createdAt} DESC, ${moderationDecisions.id} DESC)`.as(
          'ordinal'
        )
    })
    .from(moderationDecisions)
    .where(eq(moderationDecisions.moderatableType, type))
    .as('latest_decisions');

  return qb
    .select({ id: latest.moderatableId })
    .from(latest)
    .where(and(eq(latest.ordinal, 1), eq(latest.outcome, 'removed')));
}

export function visible(column: SQLWrapper, type: ModeratableType): SQL {
  return notInArray(column, removedIds(type));
}

export function publicMap(): SQL | undefined {
  return and(
    eq(maps.status, 'published'),
    eq(maps.private, false),
    visible(maps.id, 'Map')
  );
}

function onMap(column: SQLWrapper, condition: SQL | undefined): SQL {
  return inArray(
    column,
    qb.select({ id: maps.id }).from(maps).where(condition)
  );
}

export function publicPin(): SQL | undefined {
  return and(
    eq(pins.status, 'published'),
    visible(pins.id, 'Pin'),
    onMap(pins.mapId, publicMap())
  );
}

export function publicChapter(): SQL | undefined {
  return and(
    eq(chapters.status, 'published'),
    visible(chapters.id, 'Chapter'),
    onMap(chapters.mapId, publicMap())
  );
}

function coauthoredBy(viewer: Viewer) {
  return qb
    .select({ id: coauthorships.mapId })
    .from(coauthorships)
    .where(eq(coauthorships.userId, viewer.id));
}

export function bookmarkedBy(viewer: Viewer) {
  return qb
    .select({ id: bookmarks.mapId })
    .from(bookmarks)
    .where(eq(bookmarks.userId, viewer.id));
}

export function referenceableMap(viewer: Viewer): SQL | undefined {
  return and(
    or(
      eq(maps.private, false),
      eq(maps.userId, viewer.id),
      inArray(maps.id, coauthoredBy(viewer))
    ),
    eq(maps.status, 'published'),
    visible(maps.id, 'Map'),
    notBlocking(viewer, maps.userId)
  );
}

export function editableMap(viewer: Viewer): SQL | undefined {
  return and(
    or(eq(maps.userId, viewer.id), inArray(maps.id, coauthoredBy(viewer))),
    eq(maps.status, 'published'),
    visible(maps.id, 'Map')
  );
}

export function relatedMap(viewer: Viewer): SQL | undefined {
  return and(
    or(
      eq(maps.userId, viewer.id),
      inArray(maps.id, coauthoredBy(viewer)),
      and(eq(maps.private, false), inArray(maps.id, bookmarkedBy(viewer)))
    ),
    eq(maps.status, 'published'),
    visible(maps.id, 'Map')
  );
}

export function recommendableMap(viewer: Viewer): SQL | undefined {
  return and(
    publicMap(),
    notInArray(maps.id, bookmarkedBy(viewer)),
    shownTo(viewer, maps.userId)
  );
}

export function referenceablePin(viewer: Viewer): SQL | undefined {
  return and(
    eq(pins.status, 'published'),
    visible(pins.id, 'Pin'),
    onMap(pins.mapId, referenceableMap(viewer)),
    notBlocking(viewer, pins.userId)
  );
}

export function feedPin(viewer: Viewer): SQL | undefined {
  return and(
    eq(pins.status, 'published'),
    visible(pins.id, 'Pin'),
    onMap(pins.mapId, relatedMap(viewer)),
    shownTo(viewer, pins.userId)
  );
}

export function referenceableChapter(viewer: Viewer): SQL | undefined {
  return and(
    eq(chapters.status, 'published'),
    visible(chapters.id, 'Chapter'),
    onMap(chapters.mapId, referenceableMap(viewer)),
    notBlocking(viewer, chapters.userId)
  );
}

export function readableChapter(viewer: Viewer): SQL | undefined {
  return and(
    or(referenceableChapter(viewer), eq(chapters.userId, viewer.id)),
    ne(chapters.status, 'deleted'),
    visible(chapters.id, 'Chapter')
  );
}

export function feedChapter(viewer: Viewer): SQL | undefined {
  return and(
    eq(chapters.status, 'published'),
    visible(chapters.id, 'Chapter'),
    onMap(chapters.mapId, relatedMap(viewer)),
    shownTo(viewer, chapters.userId)
  );
}

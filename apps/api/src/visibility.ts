import {
  and,
  eq,
  ne,
  not,
  or,
  type SQL,
  type SQLWrapper,
  sql
} from 'drizzle-orm';
import { inIds } from './db/client.ts';
import { bookmarks, chapters, coauthorships, maps, pins } from './db/schema.ts';

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

export function shownTo(viewer: Viewer, userId: SQLWrapper): SQL {
  return and(
    notBlocking(viewer, userId),
    notBlockedBy(viewer, userId),
    notMutedBy(viewer, userId)
  ) as SQL;
}

export function removedIds(type: ModeratableType): SQL {
  return sql`SELECT moderatable_id FROM (
    SELECT moderatable_id, outcome,
      row_number() OVER (PARTITION BY moderatable_id ORDER BY created_at DESC, id DESC) AS ordinal
    FROM moderation_decisions WHERE moderatable_type = ${type}
  ) WHERE ordinal = 1 AND outcome = 'removed'`;
}

export function visible(column: SQLWrapper, type: ModeratableType): SQL {
  return sql`${column} NOT IN (${removedIds(type)})`;
}

export function publicMap(): SQL {
  return and(
    eq(maps.status, 'published'),
    eq(maps.private, false),
    visible(maps.id, 'Map')
  ) as SQL;
}

function onMap(column: SQLWrapper, condition: SQL): SQL {
  return sql`${column} IN (SELECT ${maps.id} FROM ${maps} WHERE ${condition})`;
}

export function publicPin(): SQL {
  return and(
    eq(pins.status, 'published'),
    visible(pins.id, 'Pin'),
    onMap(pins.mapId, publicMap())
  ) as SQL;
}

export function publicChapter(): SQL {
  return and(
    eq(chapters.status, 'published'),
    visible(chapters.id, 'Chapter'),
    onMap(chapters.mapId, publicMap())
  ) as SQL;
}

function coauthoredBy(viewer: Viewer): SQL {
  return sql`${maps.id} IN (SELECT ${coauthorships.mapId} FROM ${coauthorships} WHERE ${coauthorships.userId} = ${viewer.id})`;
}

function bookmarkedBy(viewer: Viewer): SQL {
  return sql`${maps.id} IN (SELECT ${bookmarks.mapId} FROM ${bookmarks} WHERE ${bookmarks.userId} = ${viewer.id})`;
}

export function referenceableMap(viewer: Viewer): SQL {
  return and(
    or(
      eq(maps.private, false),
      eq(maps.userId, viewer.id),
      coauthoredBy(viewer)
    ),
    eq(maps.status, 'published'),
    visible(maps.id, 'Map'),
    notBlocking(viewer, maps.userId)
  ) as SQL;
}

export function relatedMap(viewer: Viewer): SQL {
  return and(
    or(
      eq(maps.userId, viewer.id),
      coauthoredBy(viewer),
      and(eq(maps.private, false), bookmarkedBy(viewer))
    ),
    eq(maps.status, 'published'),
    visible(maps.id, 'Map')
  ) as SQL;
}

export function recommendableMap(viewer: Viewer): SQL {
  return and(
    publicMap(),
    sql`NOT (${bookmarkedBy(viewer)})`,
    shownTo(viewer, maps.userId)
  ) as SQL;
}

export function referenceablePin(viewer: Viewer): SQL {
  return and(
    eq(pins.status, 'published'),
    visible(pins.id, 'Pin'),
    onMap(pins.mapId, referenceableMap(viewer)),
    notBlocking(viewer, pins.userId)
  ) as SQL;
}

export function feedPin(viewer: Viewer): SQL {
  return and(
    eq(pins.status, 'published'),
    visible(pins.id, 'Pin'),
    onMap(pins.mapId, relatedMap(viewer)),
    shownTo(viewer, pins.userId)
  ) as SQL;
}

export function referenceableChapter(viewer: Viewer): SQL {
  return and(
    eq(chapters.status, 'published'),
    visible(chapters.id, 'Chapter'),
    onMap(chapters.mapId, referenceableMap(viewer)),
    notBlocking(viewer, chapters.userId)
  ) as SQL;
}

export function readableChapter(viewer: Viewer): SQL {
  return and(
    or(referenceableChapter(viewer), eq(chapters.userId, viewer.id)),
    ne(chapters.status, 'deleted'),
    visible(chapters.id, 'Chapter')
  ) as SQL;
}

export function feedChapter(viewer: Viewer): SQL {
  return and(
    eq(chapters.status, 'published'),
    visible(chapters.id, 'Chapter'),
    onMap(chapters.mapId, relatedMap(viewer)),
    shownTo(viewer, chapters.userId)
  ) as SQL;
}

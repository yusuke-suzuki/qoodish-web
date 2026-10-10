import { and, eq, type SQL, type SQLWrapper, sql } from 'drizzle-orm';
import { chapters, maps, pins } from './db/schema.ts';

export type ModeratableType = 'Map' | 'Pin' | 'Chapter' | 'Comment';

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

function onPublicMap(column: SQLWrapper): SQL {
  return sql`${column} IN (SELECT ${maps.id} FROM ${maps} WHERE ${publicMap()})`;
}

export function publicPin(): SQL {
  return and(
    eq(pins.status, 'published'),
    visible(pins.id, 'Pin'),
    onPublicMap(pins.mapId)
  ) as SQL;
}

export function publicChapter(): SQL {
  return and(
    eq(chapters.status, 'published'),
    visible(chapters.id, 'Chapter'),
    onPublicMap(chapters.mapId)
  ) as SQL;
}

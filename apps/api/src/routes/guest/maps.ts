import type {
  GuestChapter,
  GuestCoauthor,
  GuestMap,
  GuestPin,
  PinProperty
} from '@qoodish/api-contract';
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  max,
  sql
} from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../app.ts';
import { guestChapters } from '../../chapters.ts';
import {
  bookmarks,
  chapters,
  featuredMaps,
  maps,
  pins
} from '../../db/schema.ts';
import { ApiError } from '../../errors.ts';
import { coauthorsOf, guestMaps, pinPropertiesOf } from '../../maps.ts';
import { guestPins } from '../../pins.ts';
import { first, present } from '../../routing.ts';
import { SEARCH_LIMIT, searchCondition } from '../../search.ts';
import {
  flag,
  id,
  pathParams,
  queryParams,
  searchInput
} from '../../validation.ts';
import { publicChapter, publicMap, publicPin } from '../../visibility.ts';

const mapParams = pathParams(z.object({ mapId: id }));
const listingQuery = queryParams(
  z.object({
    input: searchInput,
    recent: z.string().optional().transform(present),
    active: flag,
    popular: flag,
    recommend: flag
  })
);

const RECENT_MAPS_LIMIT = 12;
const ACTIVE_MAPS_LIMIT = 12;
const POPULAR_MAPS_LIMIT = 10;
const RECOMMENDED_MAPS_LIMIT = 10;

const app = new Hono<AppEnv>();

app.get('/', listingQuery, async (c) => {
  const db = c.get('db');
  const { input, recent, active, popular, recommend } = c.req.valid('query');
  const publicMaps = db.select(getTableColumns(maps)).from(maps);

  if (input !== undefined) {
    const matched = searchCondition(input, {
      index: 'maps_fts',
      id: maps.id,
      columns: ['name', 'description']
    });

    if (!matched) {
      return c.json<GuestMap[]>([]);
    }

    return c.json<GuestMap[]>(
      await guestMaps(
        db,
        await publicMaps
          .where(and(publicMap(), matched))
          .orderBy(desc(maps.createdAt), desc(maps.id))
          .limit(SEARCH_LIMIT)
      )
    );
  }

  if (recent) {
    return c.json<GuestMap[]>(
      await guestMaps(
        db,
        await publicMaps
          .where(publicMap())
          .orderBy(desc(maps.createdAt), desc(maps.id))
          .limit(RECENT_MAPS_LIMIT)
      )
    );
  }

  if (active) {
    return c.json<GuestMap[]>(
      await guestMaps(
        db,
        await publicMaps
          .leftJoin(
            pins,
            and(eq(pins.mapId, maps.id), eq(pins.status, 'published'))
          )
          .where(publicMap())
          .groupBy(maps.id)
          .orderBy(desc(max(pins.createdAt)), asc(maps.id))
          .limit(ACTIVE_MAPS_LIMIT)
      )
    );
  }

  if (popular) {
    return c.json<GuestMap[]>(
      await guestMaps(
        db,
        await publicMaps
          .innerJoin(bookmarks, eq(bookmarks.mapId, maps.id))
          .where(publicMap())
          .groupBy(maps.id)
          .orderBy(desc(count(bookmarks.id)), asc(maps.id))
          .limit(POPULAR_MAPS_LIMIT)
      )
    );
  }

  if (recommend) {
    return c.json<GuestMap[]>(
      await guestMaps(
        db,
        await publicMaps
          .where(publicMap())
          .orderBy(sql`random()`)
          .limit(RECOMMENDED_MAPS_LIMIT)
      )
    );
  }

  throw new ApiError('BadRequest');
});

app.get('/featured', async (c) => {
  const db = c.get('db');
  const map = first(
    await db
      .select(getTableColumns(maps))
      .from(maps)
      .innerJoin(featuredMaps, eq(featuredMaps.mapId, maps.id))
      .where(publicMap())
      .orderBy(desc(featuredMaps.createdAt), desc(featuredMaps.id))
      .limit(1)
  );

  return c.json<GuestMap>(first(await guestMaps(db, [map])));
});

app.get('/:id', pathParams(z.object({ id })), async (c) => {
  const db = c.get('db');
  const map = first(
    await db
      .select()
      .from(maps)
      .where(and(publicMap(), eq(maps.id, c.req.valid('param').id)))
  );

  return c.json<GuestMap>(first(await guestMaps(db, [map])));
});

app.get('/:mapId/pins', mapParams, async (c) => {
  const db = c.get('db');
  const rows = await db
    .select()
    .from(pins)
    .where(and(publicPin(), eq(pins.mapId, c.req.valid('param').mapId)))
    .orderBy(desc(pins.createdAt), asc(pins.id));

  return c.json<GuestPin[]>(await guestPins(db, rows));
});

app.get('/:mapId/coauthors', mapParams, async (c) => {
  const db = c.get('db');
  const [map] = await db
    .select({ id: maps.id, userId: maps.userId })
    .from(maps)
    .where(and(publicMap(), eq(maps.id, c.req.valid('param').mapId)));

  return c.json<GuestCoauthor[]>(map ? await coauthorsOf(db, map) : []);
});

app.get('/:mapId/chapters', mapParams, async (c) => {
  const db = c.get('db');
  const map = first(
    await db
      .select({ id: maps.id })
      .from(maps)
      .where(and(publicMap(), eq(maps.id, c.req.valid('param').mapId)))
  );
  const rows = await db
    .select()
    .from(chapters)
    .where(and(publicChapter(), eq(chapters.mapId, map.id)))
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<GuestChapter[]>(await guestChapters(db, rows));
});

app.get('/:mapId/pin_properties', mapParams, async (c) => {
  const db = c.get('db');
  const map = first(
    await db
      .select({ id: maps.id })
      .from(maps)
      .where(and(publicMap(), eq(maps.id, c.req.valid('param').mapId)))
  );

  return c.json<PinProperty[]>(await pinPropertiesOf(db, map.id));
});

export default app;

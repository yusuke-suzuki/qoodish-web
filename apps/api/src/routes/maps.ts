import type {
  AppMap,
  Chapter,
  Coauthor,
  Pin,
  PinProperty
} from '@qoodish/api-contract';
import { and, asc, desc, eq, type SQL, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { viewerChapters } from '../chapters.ts';
import { type Database, database } from '../db/client.ts';
import { chapters, maps, pins } from '../db/schema.ts';
import { pinPropertiesOf, viewerCoauthors, viewerMaps } from '../maps.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { viewerPins } from '../pins.ts';
import { first } from '../routing.ts';
import { id, pathParams } from '../validation.ts';
import {
  recommendableMap,
  referenceableChapter,
  referenceableMap,
  referenceablePin,
  relatedMap
} from '../visibility.ts';

const RECOMMENDED_MAPS_LIMIT = 10;

const mapParams = pathParams(z.object({ mapId: id }));
const idParams = pathParams(z.object({ id }));

async function findMap(db: Database, condition: SQL | undefined) {
  return first(
    await db
      .select({ id: maps.id, userId: maps.userId })
      .from(maps)
      .where(condition)
  );
}

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows =
    c.req.query('recommend') === undefined
      ? await db
          .select()
          .from(maps)
          .where(relatedMap(viewer))
          .orderBy(desc(maps.createdAt), asc(maps.id))
      : await db
          .select()
          .from(maps)
          .where(recommendableMap(viewer))
          .orderBy(sql`random()`)
          .limit(RECOMMENDED_MAPS_LIMIT);

  return c.json<AppMap[]>(await viewerMaps(db, viewer, rows));
});

app.get('/:id', idParams, async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const map = first(
    await db
      .select()
      .from(maps)
      .where(
        and(referenceableMap(viewer), eq(maps.id, c.req.valid('param').id))
      )
  );

  return c.json<AppMap>(first(await viewerMaps(db, viewer, [map])));
});

app.get('/:mapId/pins', mapParams, async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(pins)
    .where(
      and(referenceablePin(viewer), eq(pins.mapId, c.req.valid('param').mapId))
    )
    .orderBy(desc(pins.createdAt), asc(pins.id));

  return c.json<Pin[]>(await viewerPins(db, viewer, rows));
});

app.get('/:mapId/coauthors', mapParams, async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const [map] = await db
    .select({ id: maps.id, userId: maps.userId })
    .from(maps)
    .where(
      and(referenceableMap(viewer), eq(maps.id, c.req.valid('param').mapId))
    );

  return c.json<Coauthor[]>(map ? await viewerCoauthors(db, viewer, map) : []);
});

app.get('/:mapId/chapters', mapParams, async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const map = await findMap(
    db,
    and(referenceableMap(viewer), eq(maps.id, c.req.valid('param').mapId))
  );
  const rows = await db
    .select()
    .from(chapters)
    .where(and(referenceableChapter(viewer), eq(chapters.mapId, map.id)))
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<Chapter[]>(await viewerChapters(db, viewer, rows));
});

app.get('/:mapId/pin_properties', mapParams, async (c) => {
  const db = database(c.env.DB);
  const map = await findMap(
    db,
    and(
      referenceableMap(c.get('viewer')),
      eq(maps.id, c.req.valid('param').mapId)
    )
  );

  return c.json<PinProperty[]>(await pinPropertiesOf(db, map.id));
});

export default app;

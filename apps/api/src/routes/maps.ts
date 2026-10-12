import type {
  AppMap,
  Chapter,
  Coauthor,
  CoauthorshipInvitation,
  Pin,
  PinProperty,
  PinPropertyOption
} from '@qoodish/api-contract';
import { and, asc, desc, eq, type SQL, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { bookmarkMap, unbookmarkMap } from '../bookmarks.ts';
import { viewerChapters } from '../chapters.ts';
import { invitation, inviteCoauthor } from '../coauthorship-invitations.ts';
import { type Database, scalar } from '../db/client.ts';
import { chapters, maps, pins } from '../db/schema.ts';
import { ApiError } from '../errors.ts';
import {
  createMap,
  discardMap,
  type MapRow,
  mapInput,
  newMapInput,
  pinPropertiesOf,
  removeCoauthor,
  reviseMap,
  viewerCoauthors,
  viewerMaps
} from '../maps.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import {
  createPinProperty,
  createPinPropertyOption,
  editablePinProperty,
  newPinPropertyInput,
  newPinPropertyOptionInput,
  pinPropertyDetail,
  pinPropertyInput,
  pinPropertyOptionDetail,
  pinPropertyOptionInput,
  publishedOption,
  revisePinProperty,
  revisePinPropertyOption
} from '../pin-properties.ts';
import { createPin, newPinInput, viewerPins } from '../pins.ts';
import { first } from '../routing.ts';
import { findUser } from '../users.ts';
import {
  flag,
  id,
  jsonBody,
  optionalId,
  pathParams,
  queryParams
} from '../validation.ts';
import {
  editableMap,
  recommendableMap,
  referenceableChapter,
  referenceableMap,
  referenceablePin,
  relatedMap,
  type Viewer
} from '../visibility.ts';

const RECOMMENDED_MAPS_LIMIT = 10;

const mapParams = pathParams(z.object({ mapId: id }));
const idParams = pathParams(z.object({ id }));
const coauthorParams = pathParams(z.object({ mapId: id, userId: id }));
const propertyParams = pathParams(z.object({ mapId: id, id }));
const optionsParams = pathParams(z.object({ mapId: id, propertyId: id }));
const optionParams = pathParams(z.object({ mapId: id, propertyId: id, id }));

async function findMap(db: Database, condition: SQL | undefined) {
  return first(
    await db
      .select({ id: maps.id, userId: maps.userId })
      .from(maps)
      .where(condition)
  );
}

async function editableMapRow(
  db: Database,
  viewer: Viewer,
  mapId: number
): Promise<MapRow> {
  return first(
    await db
      .select()
      .from(maps)
      .where(and(editableMap(viewer), eq(maps.id, mapId)))
  );
}

function editableMapId(db: Database, viewer: Viewer, mapId: number): SQL {
  return scalar(
    db
      .select({ id: maps.id })
      .from(maps)
      .where(and(editableMap(viewer), eq(maps.id, mapId)))
  );
}

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/', queryParams(z.object({ recommend: flag })), async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const rows = c.req.valid('query').recommend
    ? await db
        .select()
        .from(maps)
        .where(recommendableMap(viewer))
        .orderBy(sql`random()`)
        .limit(RECOMMENDED_MAPS_LIMIT)
    : await db
        .select()
        .from(maps)
        .where(relatedMap(viewer))
        .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json<AppMap[]>(await viewerMaps(db, viewer, rows));
});

app.get('/:id', idParams, async (c) => {
  const db = c.get('db');
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
  const db = c.get('db');
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
  const db = c.get('db');
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
  const db = c.get('db');
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
  const db = c.get('db');
  const map = await findMap(
    db,
    and(
      referenceableMap(c.get('viewer')),
      eq(maps.id, c.req.valid('param').mapId)
    )
  );

  return c.json<PinProperty[]>(await pinPropertiesOf(db, map.id));
});

app.post('/', jsonBody(newMapInput), async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const map = await createMap(db, viewer.id, c.req.valid('json'));

  return c.json<AppMap>(first(await viewerMaps(db, viewer, [map])));
});

app.on(['PUT', 'PATCH'], '/:id', idParams, jsonBody(mapInput), async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const mapId = c.req.valid('param').id;

  await reviseMap(db, () => editableMapRow(db, viewer, mapId), {
    editorId: viewer.id,
    changes: c.req.valid('json')
  });

  const revised = first(await db.select().from(maps).where(eq(maps.id, mapId)));

  return c.json<AppMap>(first(await viewerMaps(db, viewer, [revised])));
});

app.delete('/:id', idParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const mapId = c.req.valid('param').id;

  await discardMap(
    db,
    async () =>
      first(
        await db
          .select()
          .from(maps)
          .where(
            and(
              eq(maps.id, mapId),
              eq(maps.userId, viewer.id),
              eq(maps.status, 'published')
            )
          )
      ),
    viewer.id
  );

  return c.body(null, 204);
});

app.delete('/:mapId/coauthors/:userId', coauthorParams, async (c) => {
  const db = c.get('db');
  const { mapId, userId } = c.req.valid('param');
  const map = await findMap(
    db,
    and(eq(maps.id, mapId), eq(maps.userId, c.get('viewer').id))
  );

  await removeCoauthor(db, { mapId: map.id, userId });

  return c.body(null, 204);
});

app.post(
  '/:mapId/coauthorship_invitations',
  mapParams,
  jsonBody(
    z.object({
      user_id: z
        .union([z.number(), z.string()])
        .optional()
        .transform(optionalId)
    })
  ),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const map = await editableMapRow(db, viewer, c.req.valid('param').mapId);
    const { user_id: inviteeId } = c.req.valid('json');

    if (inviteeId === undefined) {
      throw new ApiError('NotFound');
    }

    const invitee = await findUser(db, inviteeId);
    const invitationId = await inviteCoauthor(
      db,
      c.env.WEB_PUSH_QUEUE,
      viewer,
      {
        map,
        inviteeId: invitee.id
      }
    );

    return c.json<CoauthorshipInvitation>(await invitation(db, invitationId));
  }
);

app.post('/:mapId/bookmark', mapParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const map = await bookmarkMap(db, viewer.id, c.req.valid('param').mapId);

  return c.json<AppMap>(first(await viewerMaps(db, viewer, [map])));
});

app.delete('/:mapId/bookmark', mapParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const map = await unbookmarkMap(db, {
    userId: viewer.id,
    mapId: c.req.valid('param').mapId
  });

  return c.json<AppMap>(first(await viewerMaps(db, viewer, [map])));
});

app.post('/:mapId/pins', mapParams, jsonBody(newPinInput), async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const map = await editableMapRow(db, viewer, c.req.valid('param').mapId);
  const pin = await createPin(db, {
    mapId: map.id,
    userId: viewer.id,
    changes: c.req.valid('json')
  });

  return c.json<Pin>(first(await viewerPins(db, viewer, [pin])));
});

app.post(
  '/:mapId/pin_properties',
  mapParams,
  jsonBody(newPinPropertyInput),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const map = await editableMapRow(db, viewer, c.req.valid('param').mapId);
    const propertyId = await createPinProperty(db, {
      mapId: map.id,
      editorId: viewer.id,
      changes: c.req.valid('json')
    });

    return c.json<PinProperty>(await pinPropertyDetail(db, propertyId));
  }
);

app.on(
  ['PUT', 'PATCH'],
  '/:mapId/pin_properties/:id',
  propertyParams,
  jsonBody(pinPropertyInput),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const params = c.req.valid('param');

    await revisePinProperty(
      db,
      () =>
        editablePinProperty(db, {
          id: params.id,
          mapId: editableMapId(db, viewer, params.mapId)
        }),
      { editorId: viewer.id, changes: c.req.valid('json') }
    );

    return c.json<PinProperty>(await pinPropertyDetail(db, params.id));
  }
);

app.delete('/:mapId/pin_properties/:id', propertyParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const params = c.req.valid('param');

  await revisePinProperty(
    db,
    () =>
      editablePinProperty(db, {
        id: params.id,
        mapId: editableMapId(db, viewer, params.mapId)
      }),
    { editorId: viewer.id, status: 'deleted' }
  );

  return c.body(null, 204);
});

function optionsProperty(
  db: Database,
  viewer: Viewer,
  params: { mapId: number; propertyId: number }
) {
  return editablePinProperty(db, {
    id: params.propertyId,
    mapId: editableMapId(db, viewer, params.mapId)
  });
}

async function editableOption(
  db: Database,
  viewer: Viewer,
  params: { mapId: number; propertyId: number; id: number }
) {
  const property = await optionsProperty(db, viewer, params);

  return publishedOption(db, { id: params.id, propertyId: property.id });
}

app.post(
  '/:mapId/pin_properties/:propertyId/options',
  optionsParams,
  jsonBody(newPinPropertyOptionInput),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const property = await optionsProperty(db, viewer, c.req.valid('param'));
    const optionId = await createPinPropertyOption(db, {
      propertyId: property.id,
      editorId: viewer.id,
      changes: c.req.valid('json')
    });

    return c.json<PinPropertyOption>(
      await pinPropertyOptionDetail(db, optionId)
    );
  }
);

app.on(
  ['PUT', 'PATCH'],
  '/:mapId/pin_properties/:propertyId/options/:id',
  optionParams,
  jsonBody(pinPropertyOptionInput),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const params = c.req.valid('param');

    await revisePinPropertyOption(
      db,
      () => editableOption(db, viewer, params),
      {
        editorId: viewer.id,
        changes: c.req.valid('json')
      }
    );

    return c.json<PinPropertyOption>(
      await pinPropertyOptionDetail(db, params.id)
    );
  }
);

app.delete(
  '/:mapId/pin_properties/:propertyId/options/:id',
  optionParams,
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const params = c.req.valid('param');

    await revisePinPropertyOption(
      db,
      () => editableOption(db, viewer, params),
      {
        editorId: viewer.id,
        status: 'deleted'
      }
    );

    return c.body(null, 204);
  }
);

export default app;

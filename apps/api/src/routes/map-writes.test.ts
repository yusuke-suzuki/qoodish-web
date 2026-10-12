import { env } from 'cloudflare:test';
import { asc, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { database } from '../db/client.ts';
import {
  bookmarks,
  coauthorships,
  mapRevisionImages,
  mapRevisions,
  maps,
  pinPropertyRevisions
} from '../db/schema.ts';
import { createSigner, firebaseClaims, type Signer } from '../test/jwt.ts';
import { ids, seedWorld } from '../test/world.ts';

let signer: Signer;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  signer = await createSigner();
  app = createApp({ firebaseKeys: signer.keys });
  await seedWorld(env.DB);
});

const db = () => database(env.DB);

async function send(method: string, path: string, uid: string, body?: unknown) {
  const token = await signer.sign(
    firebaseClaims(env.GOOGLE_PROJECT_ID, { sub: uid })
  );
  const res = await app.request(
    path,
    {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' })
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    },
    env
  );
  const text = await res.text();

  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function revisionsOf(mapId: number) {
  const revisions = await db()
    .select()
    .from(mapRevisions)
    .where(eq(mapRevisions.mapId, mapId))
    .orderBy(asc(mapRevisions.id));
  const images = await db().select().from(mapRevisionImages);

  return revisions.map((revision) => ({
    ...revision,
    imageIds: images
      .filter((image) => image.mapRevisionId === revision.id)
      .map((image) => image.imageId)
  }));
}

describe('POST /maps', () => {
  it('records a map with its first revision', async () => {
    const { status, body } = await send('POST', '/maps', 'bob', {
      name: 'Osaka Eats',
      description: 'Where to eat\r\nin Osaka',
      private: false,
      latitude: 34.69,
      longitude: 135.5
    });
    const [revision] = await revisionsOf(body.id);
    const [map] = await db().select().from(maps).where(eq(maps.id, body.id));

    expect(status).toBe(200);
    expect(body).toMatchObject({
      name: 'Osaka Eats',
      description: 'Where to eat\nin Osaka',
      latitude: 34.69,
      longitude: 135.5,
      private: false,
      editable: true,
      bookmarkable: false,
      bookmarking: false,
      image: null,
      author: { id: ids.bob, blocking: false, muting: false }
    });
    expect(revision).toMatchObject({
      userId: ids.bob,
      name: 'Osaka Eats',
      private: false,
      status: 'published',
      imageIds: []
    });
    expect(map?.currentRevisionId).toBe(revision?.id);
  });

  it('answers 422 for a duplicated name, an image of someone else and too many images', async () => {
    const duplicate = await send('POST', '/maps', 'alice', {
      name: 'Tokyo Ramen',
      description: 'Again'
    });
    const foreign = await send('POST', '/maps', 'bob', {
      name: 'With a borrowed image',
      description: 'Not mine',
      image_ids: [ids.ramenImage]
    });
    const crowded = await send('POST', '/maps', 'alice', {
      name: 'Two images',
      description: 'Too many',
      image_ids: [ids.ramenImage, ids.shoyuImage]
    });
    const blank = await send('POST', '/maps', 'alice', {});

    expect(duplicate).toMatchObject({
      status: 422,
      body: { detail: 'Map name is duplicated.' }
    });
    expect(foreign.body.detail).toBe('The image was not uploaded by you.');
    expect(crowded.body.detail).toBe(
      'Only one image can be attached to a map.'
    );
    expect(blank.body.detail).toBe(
      'Map name is required. Please enter a description of the map.'
    );
  });

  it('answers 404 for an image that does not exist', async () => {
    const { status } = await send('POST', '/maps', 'alice', {
      name: 'Missing image',
      description: 'Nowhere',
      image_ids: [999]
    });

    expect(status).toBe(404);
  });
});

describe('PUT /maps/:id', () => {
  it('lets a coauthor revise everything but the privacy, carrying the images', async () => {
    const { status, body } = await send('PUT', `/maps/${ids.ramen}`, 'carol', {
      name: 'Tokyo Noodles',
      private: true
    });
    const revisions = await revisionsOf(ids.ramen);

    expect(status).toBe(200);
    expect(body).toMatchObject({
      name: 'Tokyo Noodles',
      private: false,
      editable: true
    });
    expect(body.image_url).toMatch(/ramen\/public$/);
    expect(revisions.at(-1)).toMatchObject({
      userId: ids.carol,
      name: 'Tokyo Noodles',
      private: false,
      imageIds: [ids.ramenImage]
    });
  });

  it('appends nothing when the map stays the same', async () => {
    const before = await revisionsOf(ids.ramen);

    await send('PATCH', `/maps/${ids.ramen}`, 'alice', {
      name: 'Tokyo Noodles',
      image_ids: [ids.ramenImage]
    });

    expect(await revisionsOf(ids.ramen)).toHaveLength(before.length);
  });

  it("lets a coauthor send the author's image back unchanged", async () => {
    const { status } = await send('PATCH', `/maps/${ids.ramen}`, 'carol', {
      name: 'Tokyo Noodles',
      image_ids: [ids.ramenImage]
    });

    expect(status).toBe(200);
  });

  it('rounds coordinates to six decimals and answers 400 for ones that are not numbers', async () => {
    const { body } = await send('PATCH', `/maps/${ids.ramen}`, 'alice', {
      latitude: '35.1234567',
      longitude: 139.7654321
    });
    const rejected = await Promise.all(
      [null, '', ' ', true, [35]].map(
        async (latitude) =>
          (await send('PATCH', `/maps/${ids.ramen}`, 'alice', { latitude }))
            .status
      )
    );

    expect(body).toMatchObject({ latitude: 35.123457, longitude: 139.765432 });
    expect(rejected).toEqual([400, 400, 400, 400, 400]);
  });

  it('drops the bookmarks when the author makes the map private', async () => {
    const { body } = await send('PUT', `/maps/${ids.ramen}`, 'alice', {
      private: true,
      image_ids: []
    });
    const remaining = await db()
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.mapId, ids.ramen));

    expect(body).toMatchObject({ private: true, image: null });
    expect(remaining).toEqual([]);
    expect((await revisionsOf(ids.ramen)).at(-1)).toMatchObject({
      private: true,
      imageIds: []
    });
  });

  it('answers 404 on a map the user cannot edit', async () => {
    expect((await send('PUT', `/maps/${ids.cafe}`, 'alice', {})).status).toBe(
      404
    );
  });
});

describe('DELETE /maps/:id', () => {
  it('lets only the author discard a map, as a revision', async () => {
    const byCoauthor = await send('DELETE', `/maps/${ids.ramen}`, 'carol');
    const byAuthor = await send('DELETE', `/maps/${ids.secret}`, 'alice');
    const [map] = await db().select().from(maps).where(eq(maps.id, ids.secret));

    expect(byCoauthor.status).toBe(404);
    expect(byAuthor.status).toBe(204);
    expect(map?.status).toBe('deleted');
    expect((await revisionsOf(ids.secret)).at(-1)).toMatchObject({
      status: 'deleted',
      userId: ids.alice
    });
  });
});

describe('DELETE /maps/:mapId/coauthors/:userId', () => {
  it('lets the author remove a coauthor once', async () => {
    const path = `/maps/${ids.ramen}/coauthors/${ids.carol}`;

    expect((await send('DELETE', path, 'carol')).status).toBe(404);
    expect((await send('DELETE', path, 'alice')).status).toBe(204);
    expect((await send('DELETE', path, 'alice')).status).toBe(404);
    expect(
      await db()
        .select()
        .from(coauthorships)
        .where(eq(coauthorships.mapId, ids.ramen))
    ).toEqual([]);
  });
});

describe('pin properties', () => {
  it('records, revises and discards a property and its options', async () => {
    const base = `/maps/${ids.ramen}/pin_properties`;
    const created = await send('POST', base, 'alice', {
      name: ' Spice ',
      position: 3,
      multiple: true
    });
    const propertyPath = `${base}/${created.body.id}`;
    const renamed = await send('PUT', propertyPath, 'alice', {
      name: 'Heat',
      multiple: false
    });
    const option = await send('POST', `${propertyPath}/options`, 'alice', {
      name: 'Mild'
    });
    const optionPath = `${propertyPath}/options/${option.body.id}`;
    const revisedOption = await send('PATCH', optionPath, 'alice', {
      position: 2
    });
    const revisions = await db()
      .select()
      .from(pinPropertyRevisions)
      .where(eq(pinPropertyRevisions.pinPropertyId, created.body.id));

    expect(created).toMatchObject({
      status: 200,
      body: { name: 'Spice', position: 3, multiple: true, options: [] }
    });
    expect(renamed.body).toMatchObject({ name: 'Heat', multiple: true });
    expect(option.body).toMatchObject({ name: 'Mild', position: 0 });
    expect(revisedOption.body).toMatchObject({ name: 'Mild', position: 2 });
    expect(revisions.map(({ name }) => name)).toEqual(['Spice', 'Heat']);

    expect((await send('DELETE', optionPath, 'alice')).status).toBe(204);
    expect((await send('PUT', propertyPath, 'alice', {})).body.options).toEqual(
      []
    );
    expect((await send('DELETE', propertyPath, 'alice')).status).toBe(204);

    const listed = await send('GET', base, 'alice');

    expect(listed.body.map(({ id }: { id: number }) => id)).not.toContain(
      created.body.id
    );
  });

  it('answers 422 for a blank name and 404 on a map the user cannot edit', async () => {
    const blank = await send(
      'POST',
      `/maps/${ids.ramen}/pin_properties`,
      'alice',
      { name: '   ' }
    );
    const foreign = await send(
      'POST',
      `/maps/${ids.cafe}/pin_properties`,
      'alice',
      { name: 'Mine' }
    );

    expect(blank).toMatchObject({
      status: 422,
      body: { detail: 'Tag name is required.' }
    });
    expect(foreign.status).toBe(404);
  });

  it('answers 400 for a position that is not a whole number', async () => {
    const rejected = await Promise.all(
      [null, '', -1, 1.5, true].map(
        async (position) =>
          (
            await send('POST', `/maps/${ids.ramen}/pin_properties`, 'alice', {
              name: 'Placed',
              position
            })
          ).status
      )
    );
    const accepted = await send(
      'POST',
      `/maps/${ids.ramen}/pin_properties`,
      'alice',
      { name: 'Placed', position: '4' }
    );

    expect(rejected).toEqual([400, 400, 400, 400, 400]);
    expect(accepted.body).toMatchObject({ name: 'Placed', position: 4 });
  });
});

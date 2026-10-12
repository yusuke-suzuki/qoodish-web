import { env } from 'cloudflare:test';
import { asc, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { database } from '../db/client.ts';
import {
  pinRevisionImages,
  pinRevisionPropertyOptions,
  pinRevisions,
  pins
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

async function revisionsOf(pinId: number) {
  const revisions = await db()
    .select()
    .from(pinRevisions)
    .where(eq(pinRevisions.pinId, pinId))
    .orderBy(asc(pinRevisions.id));
  const revisionImages = await db()
    .select()
    .from(pinRevisionImages)
    .orderBy(asc(pinRevisionImages.imageId));
  const revisionOptions = await db()
    .select()
    .from(pinRevisionPropertyOptions)
    .orderBy(asc(pinRevisionPropertyOptions.pinPropertyOptionId));

  return revisions.map((revision) => ({
    ...revision,
    imageIds: revisionImages
      .filter((image) => image.pinRevisionId === revision.id)
      .map((image) => image.imageId),
    propertyOptionIds: revisionOptions
      .filter((option) => option.pinRevisionId === revision.id)
      .map((option) => option.pinPropertyOptionId)
  }));
}

describe('POST /maps/:mapId/pins', () => {
  it('records a pin with its first revision', async () => {
    const { status, body } = await send(
      'POST',
      `/maps/${ids.ramen}/pins`,
      'alice',
      {
        name: 'Miso Ramen',
        comment: 'Rich\r\nand warm',
        latitude: 35.69,
        longitude: 139.7,
        image_ids: [ids.shoyuImage],
        property_option_ids: [ids.salty]
      }
    );
    const [revision] = await revisionsOf(body.id);
    const [pin] = await db().select().from(pins).where(eq(pins.id, body.id));

    expect(status).toBe(200);
    expect(body).toMatchObject({
      name: 'Miso Ramen',
      comment: 'Rich\nand warm',
      latitude: 35.69,
      longitude: 139.7,
      editable: true,
      liked: false,
      likes_count: 0,
      comments: [],
      property_option_ids: [ids.salty],
      map: { id: ids.ramen },
      author: { id: ids.alice }
    });
    expect(body.images).toHaveLength(1);
    expect(revision).toMatchObject({
      userId: ids.alice,
      name: 'Miso Ramen',
      status: 'published',
      imageIds: [ids.shoyuImage],
      propertyOptionIds: [ids.salty]
    });
    expect(pin?.currentRevisionId).toBe(revision?.id);
  });

  it('answers 422 for missing fields, too many images and unusable tags', async () => {
    const path = `/maps/${ids.ramen}/pins`;
    const valid = {
      name: 'Tonkotsu',
      comment: 'Creamy',
      latitude: 35.6,
      longitude: 139.6
    };
    const blank = await send('POST', path, 'alice', {});
    const crowded = await send('POST', path, 'alice', {
      ...valid,
      image_ids: [
        ids.aliceImage,
        ids.ramenImage,
        ids.shoyuImage,
        ids.shoyuSecondImage,
        ids.chapterImage
      ]
    });
    const retired = await send('POST', path, 'alice', {
      ...valid,
      property_option_ids: [ids.sweet]
    });
    const borrowed = await send('POST', path, 'carol', {
      ...valid,
      image_ids: [ids.ramenImage]
    });
    const nowhere = await send('POST', path, 'alice', {
      ...valid,
      latitude: null,
      longitude: ''
    });

    expect(blank).toMatchObject({
      status: 422,
      body: {
        detail:
          'Comment is required. Pin name is required. Please choose where the pin is.'
      }
    });
    expect(crowded.body.detail).toBe(
      'Up to 4 images can be attached to a pin.'
    );
    expect(retired.body.detail).toBe(
      'Some of the tags chosen cannot be used on this pin.'
    );
    expect(borrowed.body.detail).toBe('The image was not uploaded by you.');
    expect(nowhere).toMatchObject({
      status: 422,
      body: { detail: 'Please choose where the pin is.' }
    });
  });

  it('allows one option of a single-choice tag', async () => {
    const property = await send(
      'POST',
      `/maps/${ids.ramen}/pin_properties`,
      'alice',
      { name: 'Broth', multiple: false }
    );
    const optionsPath = `/maps/${ids.ramen}/pin_properties/${property.body.id}/options`;
    const pork = await send('POST', optionsPath, 'alice', { name: 'Pork' });
    const chicken = await send('POST', optionsPath, 'alice', {
      name: 'Chicken'
    });
    const both = await send('POST', `/maps/${ids.ramen}/pins`, 'carol', {
      name: 'Mixed',
      comment: 'Both broths',
      latitude: 35.6,
      longitude: 139.6,
      property_option_ids: [pork.body.id, chicken.body.id]
    });

    expect(both).toMatchObject({
      status: 422,
      body: { detail: 'Some of the tags chosen cannot be used on this pin.' }
    });
  });

  it('answers 404 for an unknown tag and on a map the user cannot edit', async () => {
    const unknown = await send('POST', `/maps/${ids.ramen}/pins`, 'alice', {
      name: 'Unknown',
      comment: 'Unknown tag',
      latitude: 35.6,
      longitude: 139.6,
      property_option_ids: [999]
    });
    const foreign = await send('POST', `/maps/${ids.cafe}/pins`, 'alice', {
      name: 'Latte',
      comment: 'Not my map',
      latitude: 35,
      longitude: 135.5
    });

    expect(unknown.status).toBe(404);
    expect(foreign.status).toBe(404);
  });
});

describe('PUT /me/pins/:id', () => {
  it('revises the pin, carrying the images and tags', async () => {
    const { status, body } = await send(
      'PUT',
      `/me/pins/${ids.shoyu}`,
      'alice',
      { name: 'Shoyu Ramen Deluxe' }
    );
    const revision = (await revisionsOf(ids.shoyu)).at(-1);

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: ids.shoyu,
      name: 'Shoyu Ramen Deluxe',
      comment: 'Notes on Shoyu Ramen',
      editable: true
    });
    expect(revision).toMatchObject({
      userId: ids.alice,
      name: 'Shoyu Ramen Deluxe',
      imageIds: [ids.shoyuImage, ids.shoyuSecondImage],
      propertyOptionIds: [ids.salty, ids.sweet]
    });
  });

  it('appends nothing when the pin stays the same', async () => {
    const before = await revisionsOf(ids.shoyu);

    await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      name: 'Shoyu Ramen Deluxe',
      image_ids: [ids.shoyuSecondImage, ids.shoyuImage]
    });

    expect(await revisionsOf(ids.shoyu)).toHaveLength(before.length);
  });

  it('replaces the tags that are sent', async () => {
    const { body } = await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      property_option_ids: []
    });

    expect(body.property_option_ids).toEqual([]);
    expect((await revisionsOf(ids.shoyu)).at(-1)).toMatchObject({
      imageIds: [ids.shoyuImage, ids.shoyuSecondImage],
      propertyOptionIds: []
    });
  });

  it('answers 422 for a retired tag or a cleared location, appending nothing', async () => {
    const before = await revisionsOf(ids.shoyu);
    const retired = await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      property_option_ids: [ids.sweet]
    });
    const cleared = await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      latitude: null
    });

    expect(retired).toMatchObject({
      status: 422,
      body: { detail: 'Some of the tags chosen cannot be used on this pin.' }
    });
    expect(cleared).toMatchObject({
      status: 422,
      body: { detail: 'Please choose where the pin is.' }
    });
    expect(await revisionsOf(ids.shoyu)).toHaveLength(before.length);
  });

  it('answers 422 for a location that is not a number, even beside another error', async () => {
    const rejected = await Promise.all(
      ['north', null, '', ' ', true, [35.6]].map(async (latitude) =>
        send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', { latitude })
      )
    );
    const combined = await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      name: '',
      latitude: 'north'
    });

    for (const response of rejected) {
      expect(response).toMatchObject({
        status: 422,
        body: { detail: 'Please choose where the pin is.' }
      });
    }
    expect(combined.status).toBe(422);
    expect(combined.body.detail).toContain('Please choose where the pin is.');
  });

  it('rounds the location to six decimals', async () => {
    const { body } = await send('PATCH', `/me/pins/${ids.shoyu}`, 'alice', {
      latitude: 35.6812362,
      longitude: '139.7671248'
    });

    expect(body).toMatchObject({
      latitude: 35.681236,
      longitude: 139.767125
    });
  });

  it('answers 404 on a pin of someone else', async () => {
    expect(
      (await send('PUT', `/me/pins/${ids.shoyu}`, 'carol', { name: 'Mine' }))
        .status
    ).toBe(404);
  });
});

describe('DELETE /me/pins/:id', () => {
  it('discards the pin as a revision, once', async () => {
    const path = `/me/pins/${ids.shoyu}`;

    expect((await send('DELETE', path, 'carol')).status).toBe(404);
    expect((await send('DELETE', path, 'alice')).status).toBe(204);
    expect((await send('DELETE', path, 'alice')).status).toBe(404);

    const [pin] = await db().select().from(pins).where(eq(pins.id, ids.shoyu));

    expect(pin?.status).toBe('deleted');
    expect((await revisionsOf(ids.shoyu)).at(-1)).toMatchObject({
      status: 'deleted',
      userId: ids.alice,
      imageIds: [ids.shoyuImage, ids.shoyuSecondImage]
    });
  });
});

describe('pins with many tag options', () => {
  it('records and discards a pin with more options than one statement can bind', async () => {
    const property = await send(
      'POST',
      `/maps/${ids.ramen}/pin_properties`,
      'alice',
      { name: 'Toppings', multiple: true }
    );
    const optionIds: number[] = [];

    for (let index = 0; index < 30; index++) {
      const option = await send(
        'POST',
        `/maps/${ids.ramen}/pin_properties/${property.body.id}/options`,
        'alice',
        { name: `Topping ${index}` }
      );
      optionIds.push(option.body.id);
    }

    const created = await send('POST', `/maps/${ids.ramen}/pins`, 'alice', {
      name: 'Everything',
      comment: 'All the toppings',
      latitude: 35.6,
      longitude: 139.6,
      property_option_ids: optionIds
    });
    const discarded = await send(
      'DELETE',
      `/me/pins/${created.body.id}`,
      'alice'
    );
    const revisions = await revisionsOf(created.body.id);

    expect(created.status).toBe(200);
    expect(created.body.property_option_ids).toHaveLength(30);
    expect(discarded.status).toBe(204);
    expect(revisions.map((revision) => revision.propertyOptionIds)).toEqual([
      optionIds,
      optionIds
    ]);
  });
});

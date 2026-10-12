import { env } from 'cloudflare:test';
import { and, asc, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { database } from '../db/client.ts';
import {
  blocks,
  bookmarks,
  chapters,
  coauthorships,
  journeys,
  mapRevisionImages,
  mapRevisions,
  maps,
  notifications,
  pinPropertyRevisions,
  pins
} from '../db/schema.ts';
import { get, idsOf, send } from '../test/client.ts';
import { chapterRevisionsOf, pinRevisionsOf } from '../test/records.ts';
import { dave, seedDave, seedRelations } from '../test/relations.ts';
import { alice, notFound, variants } from '../test/serialized.ts';
import {
  at,
  CHAPTER_CONTENT,
  IMAGE_BASE,
  ids,
  MAP_FEATURES,
  seedWorld
} from '../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedDave(env.DB);
  await seedRelations(env.DB);
});

const db = () => database(env.DB);

async function mapRevisionsOf(mapId: number) {
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

function invite(mapId: number, uid: string, userId: number) {
  return send('POST', `/maps/${mapId}/coauthorship_invitations`, uid, {
    user_id: userId
  });
}

describe('GET /maps/:id', () => {
  it('serializes the viewer state of a map', async () => {
    expect(await get(`/maps/${ids.ramen}`, 'bob')).toEqual({
      status: 200,
      body: {
        id: ids.ramen,
        author: { ...alice, blocking: false, muting: false },
        name: 'Tokyo Ramen',
        description: 'About Tokyo Ramen',
        latitude: 35.681382,
        longitude: 139.766084,
        bookmarking: true,
        editable: false,
        bookmarkable: true,
        private: false,
        image: variants('ramen'),
        image_url: `${IMAGE_BASE}/ramen/public`,
        created_at: at(10),
        updated_at: at(10, 1)
      }
    });
  });

  it('lets coauthors edit and not bookmark', async () => {
    const { body } = await get(`/maps/${ids.ramen}`, 'carol');

    expect(body).toMatchObject({ editable: true, bookmarkable: false });
  });

  it('shows a private map to its author only', async () => {
    expect((await get(`/maps/${ids.secret}`, 'alice')).body).toMatchObject({
      private: true,
      editable: true,
      bookmarkable: false
    });
    expect(await get(`/maps/${ids.secret}`, 'bob')).toEqual({
      status: 404,
      body: notFound
    });
  });

  it('hides maps of authors who block the viewer', async () => {
    expect((await get(`/maps/${dave.map}`, 'alice')).status).toBe(404);
    expect((await get(`/maps/${dave.map}`, 'bob')).status).toBe(200);
  });
});

describe('GET /maps', () => {
  it('lists the maps the viewer owns, coauthors or bookmarked', async () => {
    expect(await idsOf('/maps', 'alice')).toEqual([
      ids.cafe,
      ids.secret,
      ids.ramen
    ]);
    expect(await idsOf('/maps', 'carol')).toEqual([ids.cafe, ids.ramen]);
  });

  it('recommends public maps the viewer neither bookmarked nor hides', async () => {
    expect(await idsOf('/maps?recommend=true', 'alice')).toEqual([ids.ramen]);
    expect((await idsOf('/maps?recommend=true', 'carol')).sort()).toEqual(
      [ids.ramen, ids.reinstatedMap, dave.map].sort()
    );
  });

  it('recommends on any recommend value and ignores unknown keys', async () => {
    for (const query of [
      '?recommend=',
      '?recommend',
      '?recommend=&recommend'
    ]) {
      expect(await idsOf(`/maps${query}`, 'alice')).toEqual([ids.ramen]);
    }
    expect(await idsOf('/maps?other=true', 'alice')).toEqual([
      ids.cafe,
      ids.secret,
      ids.ramen
    ]);
  });
});

describe('GET /maps/:mapId/coauthors', () => {
  it('tells the author that coauthors are editable', async () => {
    const { body } = await get(`/maps/${ids.ramen}/coauthors`, 'alice');

    expect(body).toEqual([
      expect.objectContaining({ id: ids.alice, author: true, editable: true }),
      expect.objectContaining({ id: ids.carol, author: false, editable: true })
    ]);
    expect((await get(`/maps/${ids.ramen}/coauthors`, 'carol')).body).toEqual([
      expect.objectContaining({ id: ids.alice, editable: false }),
      expect.objectContaining({ id: ids.carol, editable: false })
    ]);
  });

  it('answers an empty list for a map the viewer cannot see', async () => {
    expect(await get(`/maps/${ids.secret}/coauthors`, 'bob')).toEqual({
      status: 200,
      body: []
    });
  });
});

describe('GET /maps/:mapId/pins', () => {
  it('marks the comments the viewer liked', async () => {
    const { body } = await get(`/maps/${ids.ramen}/pins`, 'bob');

    expect(body).toMatchObject([
      {
        id: ids.shoyu,
        editable: false,
        liked: true,
        comments: [{ liked: false }]
      }
    ]);
  });
});

describe('POST/DELETE /maps/:mapId/bookmark', () => {
  it('bookmarks a public map of someone else, once', async () => {
    const removed = await send('DELETE', `/maps/${ids.cafe}/bookmark`, 'alice');
    const missing = await send('DELETE', `/maps/${ids.cafe}/bookmark`, 'alice');
    const added = await send('POST', `/maps/${ids.cafe}/bookmark`, 'alice');
    const duplicate = await send('POST', `/maps/${ids.cafe}/bookmark`, 'alice');

    expect(removed).toMatchObject({
      status: 200,
      body: { id: ids.cafe, bookmarking: false, bookmarkable: true }
    });
    expect(missing.status).toBe(404);
    expect(added).toMatchObject({
      status: 200,
      body: { id: ids.cafe, bookmarking: true }
    });
    expect(duplicate).toMatchObject({
      status: 422,
      body: { detail: 'The map is already bookmarked.' }
    });
  });

  it('answers 403 on a map the user edits and 404 on a private map', async () => {
    expect(
      (await send('POST', `/maps/${ids.ramen}/bookmark`, 'carol')).status
    ).toBe(403);
    expect(
      (await send('POST', `/maps/${ids.secret}/bookmark`, 'bob')).status
    ).toBe(404);
  });
});

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
    const [revision] = await pinRevisionsOf(body.id);
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
    const revisions = await pinRevisionsOf(created.body.id);

    expect(created.status).toBe(200);
    expect(created.body.property_option_ids).toHaveLength(30);
    expect(discarded.status).toBe(204);
    expect(revisions.map((revision) => revision.propertyOptionIds)).toEqual([
      optionIds,
      optionIds
    ]);
  });
});

describe('POST /maps', () => {
  it('records a map with its first revision', async () => {
    const { status, body } = await send('POST', '/maps', 'bob', {
      name: 'Osaka Eats',
      description: 'Where to eat\r\nin Osaka',
      private: false,
      latitude: 34.69,
      longitude: 135.5
    });
    const [revision] = await mapRevisionsOf(body.id);
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

describe('POST /maps/:mapId/coauthorship_invitations', () => {
  it('invites a user and notifies them', async () => {
    const { status, body } = await invite(ids.ramen, 'alice', ids.bob);
    const invited = await db()
      .select({
        notifierId: notifications.notifierId,
        recipientId: notifications.recipientId
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.key, 'coauthor_invited'),
          eq(notifications.notifiableType, 'Map'),
          eq(notifications.notifiableId, ids.ramen)
        )
      );

    expect(status).toBe(200);
    expect(body).toMatchObject({
      map: { id: ids.ramen, name: 'Tokyo Ramen' },
      inviter: { id: ids.alice },
      status: 'pending'
    });
    expect(invited).toEqual([{ notifierId: ids.alice, recipientId: ids.bob }]);
  });

  it('answers 422 for a pending invitation, the author or a coauthor', async () => {
    const pending = await invite(ids.ramen, 'carol', ids.bob);
    const author = await invite(ids.ramen, 'carol', ids.alice);
    const coauthor = await invite(ids.ramen, 'alice', ids.carol);

    expect(pending).toMatchObject({
      status: 422,
      body: { detail: 'A pending invitation already exists for this user.' }
    });
    expect(author.body.detail).toBe(
      'The author cannot be invited as a coauthor.'
    );
    expect(coauthor.body.detail).toBe('The user is already a coauthor.');
  });

  it('answers 404 for an unknown user or a map the user cannot edit', async () => {
    expect((await invite(ids.ramen, 'alice', 999)).status).toBe(404);
    expect((await invite(ids.cafe, 'carol', ids.alice)).status).toBe(404);
  });

  it('answers 404 without a user id and 400 for one of the wrong type', async () => {
    const path = `/maps/${ids.ramen}/coauthorship_invitations`;

    expect((await send('POST', path, 'alice', {})).status).toBe(404);
    expect((await send('POST', path, 'alice', { user_id: 'x' })).status).toBe(
      404
    );
    expect((await send('POST', path, 'alice', { user_id: true })).status).toBe(
      400
    );
  });
});

describe('invitations across a block', () => {
  it('answers 422 when the inviter blocks the invitee', async () => {
    await db()
      .insert(blocks)
      .values({ blockerId: ids.bob, blockedId: ids.alice, createdAt: at(30) });

    expect(await invite(ids.cafe, 'bob', ids.alice)).toMatchObject({
      status: 422,
      body: {
        detail:
          "You cannot invite an account as a coauthor when you or the map's author has blocked it or been blocked by it."
      }
    });
  });

  it('answers 422 when the map author blocks the invitee a coauthor invites', async () => {
    await db()
      .insert(coauthorships)
      .values({
        mapId: ids.cafe,
        userId: ids.carol,
        createdAt: at(30),
        updatedAt: at(30)
      });

    expect((await invite(ids.cafe, 'carol', ids.alice)).status).toBe(422);
  });

  it('answers 422 when the invitee blocks the inviter', async () => {
    await db()
      .insert(blocks)
      .values({ blockerId: ids.bob, blockedId: ids.carol, createdAt: at(31) });

    expect(await invite(ids.ramen, 'carol', ids.bob)).toMatchObject({
      status: 422
    });
  });
});

describe('PUT /maps/:id', () => {
  it('lets a coauthor revise everything but the privacy, carrying the images', async () => {
    const { status, body } = await send('PUT', `/maps/${ids.ramen}`, 'carol', {
      name: 'Tokyo Noodles',
      private: true
    });
    const revisions = await mapRevisionsOf(ids.ramen);

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
    const before = await mapRevisionsOf(ids.ramen);

    await send('PATCH', `/maps/${ids.ramen}`, 'alice', {
      name: 'Tokyo Noodles',
      image_ids: [ids.ramenImage]
    });

    expect(await mapRevisionsOf(ids.ramen)).toHaveLength(before.length);
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
    expect((await mapRevisionsOf(ids.ramen)).at(-1)).toMatchObject({
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
    expect((await mapRevisionsOf(ids.secret)).at(-1)).toMatchObject({
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

describe('POST /maps/:mapId/chapters', () => {
  const ramenJourney = 1;
  const secretJourney = 2;
  const racedJourney = 3;

  beforeAll(async () => {
    await db()
      .insert(journeys)
      .values([
        {
          id: racedJourney,
          userId: ids.alice,
          mapId: ids.ramen,
          createdAt: at(4),
          updatedAt: at(4)
        },
        {
          id: ramenJourney,
          userId: ids.alice,
          mapId: ids.ramen,
          createdAt: at(4),
          updatedAt: at(4)
        },
        {
          id: secretJourney,
          userId: ids.alice,
          mapId: ids.secret,
          createdAt: at(4),
          updatedAt: at(4)
        }
      ]);
  });

  it('records a draft with its first revision on a map of someone else', async () => {
    const { status, body } = await send(
      'POST',
      `/maps/${dave.map}/chapters`,
      'carol',
      {
        title: 'A walk',
        content: CHAPTER_CONTENT,
        status: 'published',
        image_ids: [ids.chapterImage],
        journey_id: ''
      }
    );

    expect(status).toBe(200);

    const [revision, ...later] = await chapterRevisionsOf(body.id);
    const [chapter] = await db()
      .select()
      .from(chapters)
      .where(eq(chapters.id, body.id));

    expect(body).toMatchObject({
      map_id: dave.map,
      journey_id: null,
      title: 'A walk',
      status: 'draft',
      content: CHAPTER_CONTENT,
      map_features: { type: 'FeatureCollection', features: [] },
      image: null,
      image_url: '',
      author: { id: ids.carol, blocking: false, muting: false },
      map: { id: dave.map, name: 'Dave Diner', private: false },
      journal: null,
      editable: true,
      liked: false,
      likes_count: 0,
      comments_count: 0
    });
    expect(revision).toMatchObject({
      userId: ids.carol,
      title: 'A walk',
      status: 'draft',
      imageIds: []
    });
    expect(later).toEqual([]);
    expect(chapter?.currentRevisionId).toBe(revision?.id);
  });

  it('records the journey it was written from, once', async () => {
    const path = `/maps/${ids.ramen}/chapters`;
    const chapter = {
      title: 'A journey',
      content: CHAPTER_CONTENT,
      map_features: MAP_FEATURES
    };
    const recorded = await send('POST', path, 'alice', {
      ...chapter,
      journey_id: String(ramenJourney)
    });
    const repeated = await send('POST', path, 'alice', {
      ...chapter,
      journey_id: ramenJourney
    });

    expect(recorded.body).toMatchObject({
      journey_id: ramenJourney,
      map_features: MAP_FEATURES,
      journal: { id: 1, title: "Alice's journal" }
    });
    expect(repeated).toMatchObject({
      status: 422,
      body: { detail: 'A chapter has already been created for this journey.' }
    });
  });

  it('records one chapter for a journey sent twice at once', async () => {
    const responses = await Promise.all(
      [1, 2].map(() =>
        send('POST', `/maps/${ids.ramen}/chapters`, 'alice', {
          title: 'A race',
          content: CHAPTER_CONTENT,
          journey_id: racedJourney
        })
      )
    );
    const recorded = await db()
      .select({ id: chapters.id })
      .from(chapters)
      .where(eq(chapters.journeyId, racedJourney));

    expect(
      responses
        .map(({ status, body }) => [status, body.journey_id ?? body.detail])
        .sort()
    ).toEqual([
      [200, racedJourney],
      [422, 'A chapter has already been created for this journey.']
    ]);
    expect(recorded).toHaveLength(1);
  });

  it('answers 422 for a journey on another map and 404 for one of someone else', async () => {
    const chapter = { title: 'A journey', content: CHAPTER_CONTENT };

    expect(
      await send('POST', `/maps/${ids.ramen}/chapters`, 'alice', {
        ...chapter,
        journey_id: secretJourney
      })
    ).toMatchObject({
      status: 422,
      body: {
        detail:
          'The journey does not belong to the author or the map of the chapter.'
      }
    });
    expect(
      (
        await send('POST', `/maps/${dave.map}/chapters`, 'carol', {
          ...chapter,
          journey_id: ramenJourney
        })
      ).status
    ).toBe(404);
    expect(
      (
        await send('POST', `/maps/${ids.ramen}/chapters`, 'alice', {
          ...chapter,
          journey_id: 'first'
        })
      ).status
    ).toBe(404);
  });

  it('answers 422 with the messages of every invalid field', async () => {
    const path = `/maps/${ids.ramen}/chapters`;
    const blank = await send('POST', path, 'alice', { content: 'Hello' });
    const malformed = await send('POST', path, 'alice', {
      title: 'x'.repeat(101),
      content: { foo: 'bar' },
      map_features: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [181, 35] }
          }
        ]
      }
    });
    const japanese = await send(
      'POST',
      path,
      'alice',
      { title: ' ', content: CHAPTER_CONTENT },
      'ja'
    );

    expect(blank).toMatchObject({
      status: 422,
      body: {
        detail:
          'Chapter title is required. Chapter content is not a valid document.'
      }
    });
    expect(malformed).toMatchObject({
      status: 422,
      body: {
        detail:
          'Chapter title is too long. (Max: 100) Chapter content is not a valid document. Chapter map features are not a valid GeoJSON FeatureCollection.'
      }
    });
    expect(japanese).toMatchObject({
      status: 422,
      body: { detail: 'チャプターのタイトルを入力してください。' }
    });
  });

  it('answers 422 for a document that is too large', async () => {
    const { status, body } = await send(
      'POST',
      `/maps/${ids.ramen}/chapters`,
      'alice',
      {
        title: 'Long',
        content: { root: { text: 'x'.repeat(1024 * 1024) } }
      }
    );

    expect(status).toBe(422);
    expect(body.detail).toBe('Chapter content is too large.');
  });

  it('answers 404 on a map the user cannot see and 401 without a user', async () => {
    const chapter = { title: 'A walk', content: CHAPTER_CONTENT };

    expect(
      (await send('POST', `/maps/${ids.secret}/chapters`, 'bob', chapter))
        .status
    ).toBe(404);
    expect(
      (await send('POST', `/maps/${dave.map}/chapters`, 'alice', chapter))
        .status
    ).toBe(404);
    expect(
      (await send('POST', `/maps/${ids.ramen}/chapters`, undefined, chapter))
        .status
    ).toBe(401);
  });
});

import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type { Pin } from '../../types/index.ts';
import {
  apiRequests,
  failWith,
  recordedEvents,
  resetServerActionMocks,
  respondWith,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const page = [{ id: 3 }] as Pin[];

const getTimelinePins = mock.fn<(nextTimestamp: string) => Promise<Pin[]>>(
  async () => page
);
const getPinFeed = mock.fn<
  (lang: string, nextTimestamp: string, nextId: number) => Promise<Pin[]>
>(async () => page);
const getUserPins = mock.fn<
  (userId: string, lang?: string, nextTimestamp?: string) => Promise<Pin[]>
>(async () => page);
const getMyPins = mock.fn<
  (lang?: string, nextTimestamp?: string) => Promise<Pin[]>
>(async () => page);

mock.module(new URL('../lib/pins.ts', import.meta.url).href, {
  namedExports: { getTimelinePins, getPinFeed }
});
mock.module(new URL('../lib/users.ts', import.meta.url).href, {
  namedExports: { getUserPins, getMyPins }
});

const actions = () => import('./pins.ts');

const params = {
  name: 'Kissa',
  comment: 'Great toast',
  latitude: 35.68,
  longitude: 139.76,
  image_ids: [1, 2]
};

const pin = { id: 3, map: { id: 2 }, author: { id: 9 } };

beforeEach(resetServerActionMocks);

describe('pin pagination', () => {
  it('pages the timeline from the cursor', async () => {
    const { fetchMoreTimelinePins } = await actions();

    assert.equal(await fetchMoreTimelinePins('t1'), page);
    assert.deepEqual(getTimelinePins.mock.calls.at(-1)?.arguments, ['t1']);
  });

  it('pages the pin feed in the reader’s language', async () => {
    const { fetchMorePinFeed } = await actions();

    assert.equal(await fetchMorePinFeed('ja', 't1', 4), page);
    assert.deepEqual(getPinFeed.mock.calls.at(-1)?.arguments, ['ja', 't1', 4]);
  });

  it('pages a user’s pins by their id', async () => {
    const { fetchMoreUserPins } = await actions();

    assert.equal(await fetchMoreUserPins(9, 't1'), page);
    assert.deepEqual(getUserPins.mock.calls.at(-1)?.arguments, [
      '9',
      undefined,
      't1'
    ]);
  });

  it('pages the signed-in user’s pins', async () => {
    const { fetchMoreMyPins } = await actions();

    assert.equal(await fetchMoreMyPins('t1'), page);
    assert.deepEqual(getMyPins.mock.calls.at(-1)?.arguments, [undefined, 't1']);
  });
});

describe('createPin', () => {
  it('creates the pin on the map, refreshes lists and records it', async () => {
    const { createPin } = await actions();
    respondWith(pin, 201);

    const result = await createPin(2, params);

    assert.deepEqual(result, { success: true, data: pin });
    assert.deepEqual(apiRequests(), [
      { path: '/maps/2/pins', method: 'POST', body: params }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2', 'pins', 'user:9']);
    assert.deepEqual(recordedEvents(), [
      { name: 'create_pin', params: { map_id: 2 } }
    ]);
  });

  it('reports the API error without side effects', async () => {
    const { createPin } = await actions();
    failWith('Name is required', 422);

    const result = await createPin(2, { ...params, name: '' });

    assert.deepEqual(result, { success: false, error: 'Name is required' });
    assert.deepEqual(revalidatedTags(), []);
    assert.deepEqual(recordedEvents(), []);
  });
});

describe('updatePin', () => {
  it('updates the pin and refreshes its map and author', async () => {
    const { updatePin } = await actions();
    respondWith(pin);

    const result = await updatePin(3, params);

    assert.deepEqual(result, { success: true, data: pin });
    assert.deepEqual(apiRequests(), [
      { path: '/me/pins/3', method: 'PUT', body: params }
    ]);
    assert.deepEqual(revalidatedTags(), ['pin:3', 'pins', 'map:2', 'user:9']);
    assert.deepEqual(recordedEvents(), []);
  });

  it('reports the API error without refreshing', async () => {
    const { updatePin } = await actions();
    failWith();

    assert.deepEqual(await updatePin(3, params), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

describe('deletePin', () => {
  it('deletes the pin and refreshes its map and author', async () => {
    const { deletePin } = await actions();

    const result = await deletePin(3, 2, 9);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/me/pins/3', method: 'DELETE', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), ['pin:3', 'pins', 'map:2', 'user:9']);
  });

  it('refreshes only the pin lists when map and author are unknown', async () => {
    const { deletePin } = await actions();

    await deletePin(3);

    assert.deepEqual(revalidatedTags(), ['pin:3', 'pins']);
  });

  it('reports the API error without refreshing', async () => {
    const { deletePin } = await actions();
    failWith();

    assert.deepEqual(await deletePin(3, 2, 9), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

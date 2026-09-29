import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  recordedEvents,
  resetServerActionMocks,
  respondWith,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const actions = () => import('./maps.ts');

const params = {
  name: 'Coffee',
  description: 'Good coffee',
  latitude: 35.68,
  longitude: 139.76,
  private: false,
  image_ids: [1]
};

const map = { id: 2, author: { id: 9 } };

beforeEach(resetServerActionMocks);

describe('createMap', () => {
  it('creates a non-invitable map, refreshes lists and records it', async () => {
    const { createMap } = await actions();
    respondWith(map, 201);

    const result = await createMap(params);

    assert.deepEqual(result, { success: true, data: map });
    assert.deepEqual(apiRequests(), [
      {
        path: '/maps',
        method: 'POST',
        body: { ...params, invitable: false }
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['maps', 'user:9']);
    assert.deepEqual(recordedEvents(), [
      { name: 'create_map', params: { map_id: 2 } }
    ]);
  });

  it('reports the API error without side effects', async () => {
    const { createMap } = await actions();
    failWith('Name is required', 422);

    const result = await createMap({ ...params, name: '' });

    assert.deepEqual(result, { success: false, error: 'Name is required' });
    assert.deepEqual(revalidatedTags(), []);
    assert.deepEqual(recordedEvents(), []);
  });
});

describe('updateMap', () => {
  it('updates the map as non-invitable and refreshes it', async () => {
    const { updateMap } = await actions();
    respondWith(map);

    const result = await updateMap(2, params);

    assert.deepEqual(result, { success: true, data: map });
    assert.deepEqual(apiRequests(), [
      {
        path: '/maps/2',
        method: 'PUT',
        body: { ...params, invitable: false }
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2', 'maps', 'user:9']);
    assert.deepEqual(recordedEvents(), []);
  });

  it('reports the API error without refreshing', async () => {
    const { updateMap } = await actions();
    failWith();

    assert.deepEqual(await updateMap(2, params), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

describe('deleteMap', () => {
  it('deletes the map and refreshes its author', async () => {
    const { deleteMap } = await actions();

    const result = await deleteMap(2, 9);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/maps/2', method: 'DELETE', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2', 'maps', 'user:9']);
  });

  it('skips the author tag when the author is unknown', async () => {
    const { deleteMap } = await actions();

    await deleteMap(2);

    assert.deepEqual(revalidatedTags(), ['map:2', 'maps']);
  });

  it('reports the API error without refreshing', async () => {
    const { deleteMap } = await actions();
    failWith();

    assert.deepEqual(await deleteMap(2, 9), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

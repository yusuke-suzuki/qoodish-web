import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiFetch,
  apiRequests,
  failWith,
  resetServerActionMocks,
  respondWith,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const actions = () => import('./pinProperties.ts');

beforeEach(resetServerActionMocks);

describe('createPinProperty', () => {
  it('defines the property with its options and refreshes the map', async () => {
    const { createPinProperty } = await actions();
    respondWith({ id: 5 });

    const result = await createPinProperty(2, {
      name: 'Payment',
      multiple: true,
      options: ['Cash only', 'PayPay']
    });

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/maps/2/pin_properties',
        method: 'POST',
        body: { name: 'Payment', multiple: true }
      },
      {
        path: '/maps/2/pin_properties/5/options',
        method: 'POST',
        body: { name: 'Cash only' }
      },
      {
        path: '/maps/2/pin_properties/5/options',
        method: 'POST',
        body: { name: 'PayPay' }
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2']);
  });

  it('reports the API error without refreshing', async () => {
    const { createPinProperty } = await actions();
    failWith('Name is required', 422);

    assert.deepEqual(
      await createPinProperty(2, {
        name: '',
        multiple: false,
        options: ['Cash only']
      }),
      {
        success: false,
        error: 'Name is required'
      }
    );
    assert.equal(apiFetch.mock.callCount(), 1);
    assert.deepEqual(revalidatedTags(), []);
  });

  it('keeps the created property when an option fails', async () => {
    const { createPinProperty } = await actions();
    apiFetch.mock.mockImplementation(async (path) =>
      path.endsWith('/options')
        ? { data: null, error: 'Name is too long', status: 422 }
        : { data: { id: 5 }, error: null, status: 200 }
    );

    const result = await createPinProperty(2, {
      name: 'Payment',
      multiple: true,
      options: ['Cash only', 'PayPay']
    });

    assert.deepEqual(result, { success: true, error: 'Name is too long' });
    assert.equal(apiFetch.mock.callCount(), 2);
    assert.deepEqual(revalidatedTags(), ['map:2']);
  });
});

describe('updatePinProperty', () => {
  it('renames the property and refreshes the map', async () => {
    const { updatePinProperty } = await actions();

    const result = await updatePinProperty(2, 5, { name: 'Genre' });

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/maps/2/pin_properties/5',
        method: 'PUT',
        body: { name: 'Genre' }
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2']);
  });
});

describe('deletePinProperty', () => {
  it('deletes the property and refreshes the map', async () => {
    const { deletePinProperty } = await actions();

    const result = await deletePinProperty(2, 5);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/maps/2/pin_properties/5', method: 'DELETE', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2']);
  });

  it('reports the API error without refreshing', async () => {
    const { deletePinProperty } = await actions();
    failWith('Not found', 404);

    assert.deepEqual(await deletePinProperty(2, 5), {
      success: false,
      error: 'Not found'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

describe('createPinPropertyOption', () => {
  it('offers the option on the property and refreshes the map', async () => {
    const { createPinPropertyOption } = await actions();

    const result = await createPinPropertyOption(2, 5, { name: 'Cash only' });

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/maps/2/pin_properties/5/options',
        method: 'POST',
        body: { name: 'Cash only' }
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2']);
  });
});

describe('updatePinPropertyOption', () => {
  it('renames the option and refreshes the map', async () => {
    const { updatePinPropertyOption } = await actions();

    const result = await updatePinPropertyOption(2, 5, 8, { name: 'PayPay' });

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/maps/2/pin_properties/5/options/8',
        method: 'PUT',
        body: { name: 'PayPay' }
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2']);
  });
});

describe('deletePinPropertyOption', () => {
  it('deletes the option and refreshes the map', async () => {
    const { deletePinPropertyOption } = await actions();

    const result = await deletePinPropertyOption(2, 5, 8);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/maps/2/pin_properties/5/options/8',
        method: 'DELETE',
        body: undefined
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2']);
  });
});

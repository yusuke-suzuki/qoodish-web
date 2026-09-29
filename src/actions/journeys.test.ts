import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  recordedEvents,
  resetServerActionMocks,
  respondWith
} from '../test/serverActionMocks.ts';

const actions = () => import('./journeys.ts');

const journey = { id: 11, map_id: 2 };

beforeEach(resetServerActionMocks);

describe('initJourney', () => {
  it('opens a journey on the map without recording a start', async () => {
    const { initJourney } = await actions();
    respondWith(journey, 201);

    const result = await initJourney(2);

    assert.deepEqual(result, { success: true, data: journey });
    assert.deepEqual(apiRequests(), [
      { path: '/maps/2/journeys', method: 'POST', body: undefined }
    ]);
    assert.deepEqual(recordedEvents(), []);
  });

  it('reports the API error', async () => {
    const { initJourney } = await actions();
    failWith();

    assert.deepEqual(await initJourney(2), {
      success: false,
      error: 'Forbidden'
    });
  });
});

describe('startJourney', () => {
  it('starts the journey and records it against its map', async () => {
    const { startJourney } = await actions();
    respondWith(journey);

    const result = await startJourney(11);

    assert.deepEqual(result, { success: true, data: journey });
    assert.deepEqual(apiRequests(), [
      { path: '/me/journeys/11/start', method: 'POST', body: undefined }
    ]);
    assert.deepEqual(recordedEvents(), [
      { name: 'start_journey', params: { map_id: 2 } }
    ]);
  });

  it('reports the API error without recording a start', async () => {
    const { startJourney } = await actions();
    failWith('Already started', 422);

    assert.deepEqual(await startJourney(11), {
      success: false,
      error: 'Already started'
    });
    assert.deepEqual(recordedEvents(), []);
  });
});

describe('finishJourney', () => {
  it('finishes the journey with its path and records it', async () => {
    const { finishJourney } = await actions();
    respondWith(journey);

    const result = await finishJourney(11, '_p~iF~ps|U');

    assert.deepEqual(result, { success: true, data: journey });
    assert.deepEqual(apiRequests(), [
      {
        path: '/me/journeys/11/finish',
        method: 'POST',
        body: { encoded_path: '_p~iF~ps|U' }
      }
    ]);
    assert.deepEqual(recordedEvents(), [
      { name: 'finish_journey', params: { map_id: 2 } }
    ]);
  });

  it('reports the API error without recording a finish', async () => {
    const { finishJourney } = await actions();
    failWith();

    assert.deepEqual(await finishJourney(11, ''), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(recordedEvents(), []);
  });
});

describe('deleteJourney', () => {
  it('deletes the journey', async () => {
    const { deleteJourney } = await actions();

    assert.deepEqual(await deleteJourney(11), { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/me/journeys/11', method: 'DELETE', body: undefined }
    ]);
  });

  it('reports the API error', async () => {
    const { deleteJourney } = await actions();
    failWith();

    assert.deepEqual(await deleteJourney(11), {
      success: false,
      error: 'Forbidden'
    });
  });
});

describe('addMilestone', () => {
  it('adds the pin as a milestone and returns it', async () => {
    const { addMilestone } = await actions();
    const milestone = { id: 30, pin_id: 3 };
    respondWith(milestone, 201);

    const result = await addMilestone(11, 3);

    assert.deepEqual(result, { success: true, data: milestone });
    assert.deepEqual(apiRequests(), [
      {
        path: '/me/journeys/11/milestones',
        method: 'POST',
        body: { pin_id: 3 }
      }
    ]);
  });

  it('reports the API error', async () => {
    const { addMilestone } = await actions();
    failWith();

    assert.deepEqual(await addMilestone(11, 3), {
      success: false,
      error: 'Forbidden'
    });
  });
});

describe('removeMilestone', () => {
  it('removes the milestone', async () => {
    const { removeMilestone } = await actions();

    assert.deepEqual(await removeMilestone(11, 30), { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/me/journeys/11/milestones/30',
        method: 'DELETE',
        body: undefined
      }
    ]);
  });

  it('reports the API error', async () => {
    const { removeMilestone } = await actions();
    failWith();

    assert.deepEqual(await removeMilestone(11, 30), {
      success: false,
      error: 'Forbidden'
    });
  });
});

describe('addCheckin', () => {
  it('checks in at the pin now when no time is given', async () => {
    const { addCheckin } = await actions();
    const checkin = { id: 40, pin_id: 3 };
    respondWith(checkin, 201);

    const result = await addCheckin(11, 3);

    assert.deepEqual(result, { success: true, data: checkin });
    assert.deepEqual(apiRequests(), [
      { path: '/me/journeys/11/checkins', method: 'POST', body: { pin_id: 3 } }
    ]);
  });

  it('sends the check-in time when one is given', async () => {
    const { addCheckin } = await actions();

    await addCheckin(11, 3, '2026-05-01T09:00:00Z');

    assert.deepEqual(apiRequests()[0].body, {
      pin_id: 3,
      checked_in_at: '2026-05-01T09:00:00Z'
    });
  });

  it('reports the API error', async () => {
    const { addCheckin } = await actions();
    failWith('Too far away', 422);

    assert.deepEqual(await addCheckin(11, 3), {
      success: false,
      error: 'Too far away'
    });
  });
});

describe('updateCheckin', () => {
  it('updates the check-in and returns it', async () => {
    const { updateCheckin } = await actions();
    const checkin = { id: 40, note: 'Sunny' };
    respondWith(checkin);

    const result = await updateCheckin(11, 40, {
      note: 'Sunny',
      image_ids: [5]
    });

    assert.deepEqual(result, { success: true, data: checkin });
    assert.deepEqual(apiRequests(), [
      {
        path: '/me/journeys/11/checkins/40',
        method: 'PUT',
        body: { note: 'Sunny', image_ids: [5] }
      }
    ]);
  });

  it('reports the API error', async () => {
    const { updateCheckin } = await actions();
    failWith();

    assert.deepEqual(await updateCheckin(11, 40, { note: null }), {
      success: false,
      error: 'Forbidden'
    });
  });
});

describe('removeCheckin', () => {
  it('removes the check-in', async () => {
    const { removeCheckin } = await actions();

    assert.deepEqual(await removeCheckin(11, 40), { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/me/journeys/11/checkins/40', method: 'DELETE', body: undefined }
    ]);
  });

  it('reports the API error', async () => {
    const { removeCheckin } = await actions();
    failWith();

    assert.deepEqual(await removeCheckin(11, 40), {
      success: false,
      error: 'Forbidden'
    });
  });
});

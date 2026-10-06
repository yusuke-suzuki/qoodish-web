import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type {
  Image,
  JourneyCheckin,
  Milestone,
  Pin
} from '../../types/index.ts';
import { buildCheckin, buildJourney } from '../test/journeys.ts';
import {
  INACTIVITY_PAUSE_MS,
  imageIdsWith,
  imageIdsWithout,
  isEmptyPlan,
  isInactive,
  isRecording,
  remainingSpots,
  withoutCheckin,
  withReplacedCheckin
} from './journeyState.ts';

function buildPin(id: number): Pin {
  return { id } as Pin;
}

function buildImage(id: number): Image {
  return { id } as Image;
}

const plannedJourney = {
  ...buildJourney([]),
  started_at: null,
  milestones: [{ id: 1, pin_id: 100 } as Milestone]
};

describe('remainingSpots', () => {
  it('leaves out pins already checked in', () => {
    const pins = [buildPin(100), buildPin(200), buildPin(300)];
    const checkins = [buildCheckin(2, '2026-08-01T01:00:00Z')];

    const result = remainingSpots(null, pins, checkins);

    assert.deepEqual(
      result.spots.map((pin) => pin.id),
      [100, 300]
    );
  });

  it('reuses the previous result while pins and checkins are unchanged', () => {
    const pins = [buildPin(100)];
    const checkins = [buildCheckin(1, '2026-08-01T01:00:00Z')];
    const previous = remainingSpots(null, pins, checkins);

    assert.equal(remainingSpots(previous, pins, checkins), previous);
  });

  it('recomputes once a new check-in list arrives', () => {
    const pins = [buildPin(100), buildPin(200)];
    const previous = remainingSpots(null, pins, []);

    const result = remainingSpots(previous, pins, [
      buildCheckin(1, '2026-08-01T01:00:00Z')
    ]);

    assert.notEqual(result, previous);
    assert.deepEqual(
      result.spots.map((pin) => pin.id),
      [200]
    );
  });

  it('recomputes once a new pin list arrives', () => {
    const checkins: JourneyCheckin[] = [];
    const previous = remainingSpots(null, [buildPin(100)], checkins);

    const result = remainingSpots(
      previous,
      [buildPin(100), buildPin(200)],
      checkins
    );

    assert.deepEqual(
      result.spots.map((pin) => pin.id),
      [100, 200]
    );
  });
});

describe('isRecording', () => {
  const started = buildJourney([]);

  it('records a started, unfinished, unpaused journey', () => {
    assert.equal(isRecording(true, started, false), true);
  });

  it('does not record without permission to record', () => {
    assert.equal(isRecording(false, started, false), false);
  });

  it('does not record without a journey', () => {
    assert.equal(isRecording(true, null, false), false);
  });

  it('does not record a journey that has not started', () => {
    assert.equal(isRecording(true, plannedJourney, false), false);
  });

  it('does not record a finished journey', () => {
    const finished = { ...started, finished_at: '2026-08-01T05:00:00Z' };

    assert.equal(isRecording(true, finished, false), false);
  });

  it('does not record while paused', () => {
    assert.equal(isRecording(true, started, true), false);
  });
});

describe('isInactive', () => {
  const lastPositionAt = 1_000_000;

  it('stays active until the pause threshold is reached', () => {
    assert.equal(
      isInactive(lastPositionAt, lastPositionAt + INACTIVITY_PAUSE_MS - 1),
      false
    );
  });

  it('turns inactive exactly at the pause threshold', () => {
    assert.equal(
      isInactive(lastPositionAt, lastPositionAt + INACTIVITY_PAUSE_MS),
      true
    );
  });

  it('never pauses a journey that has not received a fix yet', () => {
    assert.equal(isInactive(null, Number.MAX_SAFE_INTEGER), false);
  });
});

describe('isEmptyPlan', () => {
  it('treats an unstarted journey without milestones or checkins as empty', () => {
    assert.equal(isEmptyPlan({ ...plannedJourney, milestones: [] }), true);
  });

  it('keeps an unstarted journey that still has a milestone', () => {
    assert.equal(isEmptyPlan(plannedJourney), false);
  });

  it('keeps an unstarted journey that has a check-in', () => {
    assert.equal(
      isEmptyPlan({
        ...plannedJourney,
        milestones: [],
        checkins: [buildCheckin(1, '2026-08-01T01:00:00Z')]
      }),
      false
    );
  });

  it('keeps a started journey even with nothing in it', () => {
    assert.equal(isEmptyPlan(buildJourney([])), false);
  });
});

describe('withReplacedCheckin', () => {
  it('swaps in the updated check-in and keeps the others in order', () => {
    const first = buildCheckin(1, '2026-08-01T01:00:00Z');
    const second = buildCheckin(2, '2026-08-01T02:00:00Z');
    const journey = buildJourney([first, second]);
    const updated = { ...first, note: 'Sunny' };

    const result = withReplacedCheckin(journey, updated);

    assert.deepEqual(result.checkins, [updated, second]);
    assert.equal(journey.checkins[0], first);
  });

  it('leaves the check-ins untouched when the id is unknown', () => {
    const first = buildCheckin(1, '2026-08-01T01:00:00Z');
    const journey = buildJourney([first]);

    const result = withReplacedCheckin(
      journey,
      buildCheckin(9, '2026-08-01T03:00:00Z')
    );

    assert.deepEqual(result.checkins, [first]);
  });
});

describe('withoutCheckin', () => {
  it('drops only the given check-in', () => {
    const first = buildCheckin(1, '2026-08-01T01:00:00Z');
    const second = buildCheckin(2, '2026-08-01T02:00:00Z');

    const result = withoutCheckin(buildJourney([first, second]), 1);

    assert.deepEqual(result.checkins, [second]);
  });
});

describe('checkin image ids', () => {
  const images = [buildImage(5), buildImage(6), buildImage(7)];

  it('appends a new image after the existing ones', () => {
    assert.deepEqual(imageIdsWith(images, 8), [5, 6, 7, 8]);
  });

  it('removes one image and keeps the rest in order', () => {
    assert.deepEqual(imageIdsWithout(images, 6), [5, 7]);
  });

  it('keeps every image when the removed id is absent', () => {
    assert.deepEqual(imageIdsWithout(images, 9), [5, 6, 7]);
  });
});

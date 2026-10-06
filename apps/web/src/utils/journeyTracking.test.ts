import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assertCloseTo } from '../test/assertions.ts';
import {
  movingSampleIntervalMs,
  nextAnchorState,
  nextHighAccuracy,
  type StationaryAnchor,
  shouldExtendTrail,
  stationarySampleIntervalMs,
  surveySpots,
  type TrackingFix,
  trackPosition
} from './journeyTracking.ts';

const BASE_LATITUDE = 35;
const BASE_LONGITUDE = 139;

// One meter of northward travel, exact for the haversine formula because the
// path follows a meridian.
const DEGREES_PER_METER = 180 / (Math.PI * 6371000);

const MINUTE_MS = 60 * 1000;

function pointAt(metersNorth: number) {
  return {
    latitude: BASE_LATITUDE + metersNorth * DEGREES_PER_METER,
    longitude: BASE_LONGITUDE
  };
}

function buildFix(
  metersNorth: number,
  overrides: Partial<TrackingFix> = {}
): TrackingFix {
  return {
    ...pointAt(metersNorth),
    accuracy: 10,
    speed: null,
    timestamp: 0,
    ...overrides
  };
}

function buildAnchor(
  metersNorth: number,
  overrides: Partial<StationaryAnchor> = {}
): StationaryAnchor {
  return { ...pointAt(metersNorth), accuracy: 10, since: 0, ...overrides };
}

describe('nextAnchorState', () => {
  it('opens an anchor on a precise fix', () => {
    const fix = buildFix(0, { timestamp: 1000 });

    assert.deepEqual(
      nextAnchorState({ anchor: null, stationary: false }, fix),
      {
        anchor: {
          latitude: fix.latitude,
          longitude: fix.longitude,
          accuracy: 10,
          since: 1000
        },
        stationary: false
      }
    );
  });

  it('refuses to open an anchor on a coarse fix', () => {
    const fix = buildFix(0, { accuracy: 150 });

    assert.deepEqual(nextAnchorState({ anchor: null, stationary: true }, fix), {
      anchor: null,
      stationary: false
    });
  });

  it('stays non-stationary before the stillness threshold', () => {
    const anchor = buildAnchor(0);
    const fix = buildFix(1, { timestamp: 3 * MINUTE_MS - 1 });

    assert.deepEqual(nextAnchorState({ anchor, stationary: false }, fix), {
      anchor,
      stationary: false
    });
  });

  it('turns stationary once the anchor is old enough', () => {
    const anchor = buildAnchor(0);
    const fix = buildFix(1, { timestamp: 3 * MINUTE_MS });

    assert.deepEqual(nextAnchorState({ anchor, stationary: false }, fix), {
      anchor,
      stationary: true
    });
  });

  it('lets a coarse fix inside the radius change nothing', () => {
    const anchor = buildAnchor(0);
    const fix = buildFix(1, { accuracy: 150, timestamp: 10 * MINUTE_MS });

    assert.deepEqual(nextAnchorState({ anchor, stationary: true }, fix), {
      anchor,
      stationary: true
    });
    assert.deepEqual(nextAnchorState({ anchor, stationary: false }, fix), {
      anchor,
      stationary: false
    });
  });

  it('re-anchors on genuine movement from a precise fix', () => {
    const anchor = buildAnchor(0);
    const fix = buildFix(40, { timestamp: 10 * MINUTE_MS });

    assert.deepEqual(nextAnchorState({ anchor, stationary: true }, fix), {
      anchor: {
        latitude: fix.latitude,
        longitude: fix.longitude,
        accuracy: 10,
        since: 10 * MINUTE_MS
      },
      stationary: false
    });
  });

  it('clears the anchor on genuine movement from a coarse fix', () => {
    const anchor = buildAnchor(0);
    const fix = buildFix(200, { accuracy: 150 });

    assert.deepEqual(nextAnchorState({ anchor, stationary: true }, fix), {
      anchor: null,
      stationary: false
    });
  });

  it('treats movement inside the error circle as stillness', () => {
    const anchor = buildAnchor(0);
    const fix = buildFix(100, { accuracy: 120, timestamp: 10 * MINUTE_MS });

    assert.deepEqual(nextAnchorState({ anchor, stationary: true }, fix), {
      anchor,
      stationary: true
    });
  });

  it("widens the movement threshold by the anchor's own accuracy", () => {
    const anchor = buildAnchor(0, { accuracy: 90 });
    const fix = buildFix(60, { timestamp: 3 * MINUTE_MS });

    assert.deepEqual(nextAnchorState({ anchor, stationary: false }, fix), {
      anchor,
      stationary: true
    });
  });
});

describe('shouldExtendTrail', () => {
  it('always starts an empty trail', () => {
    assert.equal(shouldExtendTrail(null, buildFix(0)), true);
  });

  it('skips points below the minimum distance', () => {
    assert.equal(shouldExtendTrail(pointAt(0), buildFix(5)), false);
  });

  it('appends points at the minimum distance', () => {
    assert.equal(shouldExtendTrail(pointAt(0), buildFix(10.01)), true);
  });

  it('raises the threshold to the reported accuracy', () => {
    assert.equal(
      shouldExtendTrail(pointAt(0), buildFix(30, { accuracy: 50 })),
      false
    );
    assert.equal(
      shouldExtendTrail(pointAt(0), buildFix(60, { accuracy: 50 })),
      true
    );
  });
});

describe('surveySpots', () => {
  it('is infinite without spots', () => {
    const survey = surveySpots(buildFix(0), []);

    assert.equal(survey.nearestMeters, Number.POSITIVE_INFINITY);
    assert.deepEqual(survey.reached, []);
  });

  it('picks the closest spot', () => {
    const survey = surveySpots(buildFix(0), [pointAt(200), pointAt(100)]);

    assertCloseTo(survey.nearestMeters, 100, 0.001);
  });

  it('reaches only spots inside the check-in radius', () => {
    const near = pointAt(49);
    const far = pointAt(60);

    assert.deepEqual(surveySpots(buildFix(0), [near, far]).reached, [near]);
  });

  it('never checks in from a coarse fix', () => {
    const survey = surveySpots(buildFix(0, { accuracy: 101 }), [pointAt(0)]);

    assert.deepEqual(survey.reached, []);
  });

  it('still measures the distance a coarse fix may not check in from', () => {
    const survey = surveySpots(buildFix(0, { accuracy: 101 }), [pointAt(100)]);

    assertCloseTo(survey.nearestMeters, 100, 0.001);
  });

  it('still checks in at the accuracy limit', () => {
    const spot = pointAt(10);

    assert.deepEqual(
      surveySpots(buildFix(0, { accuracy: 100 }), [spot]).reached,
      [spot]
    );
  });
});

describe('nextHighAccuracy', () => {
  it('keeps the continuous watch until well clear of the spot', () => {
    assert.equal(nextHighAccuracy(true, 500), true);
    assert.equal(nextHighAccuracy(true, 501), false);
  });

  it('re-enables the watch only close to a spot', () => {
    assert.equal(nextHighAccuracy(false, 300), true);
    assert.equal(nextHighAccuracy(false, 301), false);
    assert.equal(nextHighAccuracy(false, 400), false);
  });
});

describe('stationarySampleIntervalMs', () => {
  it('backs off exponentially with anchor age', () => {
    const anchor = buildAnchor(0);
    const nearest = Number.POSITIVE_INFINITY;

    assert.equal(
      stationarySampleIntervalMs(anchor, 3 * MINUTE_MS, nearest),
      60000
    );
    assert.equal(
      stationarySampleIntervalMs(anchor, 6 * MINUTE_MS, nearest),
      120000
    );
    assert.equal(
      stationarySampleIntervalMs(anchor, 9 * MINUTE_MS, nearest),
      240000
    );
  });

  it('caps the far-from-spots backoff at five minutes', () => {
    const anchor = buildAnchor(0);

    assert.equal(
      stationarySampleIntervalMs(
        anchor,
        60 * MINUTE_MS,
        Number.POSITIVE_INFINITY
      ),
      300000
    );
  });

  it('keeps a tight cap near an unvisited spot', () => {
    const anchor = buildAnchor(0);

    assert.equal(
      stationarySampleIntervalMs(anchor, 60 * MINUTE_MS, 400),
      60000
    );
  });
});

describe('movingSampleIntervalMs', () => {
  it('waits the maximum interval with no spot to reach', () => {
    assert.equal(
      movingSampleIntervalMs(buildFix(0), null, Number.POSITIVE_INFINITY),
      120000
    );
  });

  it('schedules by the reported speed with headroom', () => {
    const fix = buildFix(0, { speed: 10 });

    assert.equal(movingSampleIntervalMs(fix, null, 2300), 100000);
  });

  it('never samples faster than the minimum interval', () => {
    const fix = buildFix(0, { speed: 10 });

    assert.equal(movingSampleIntervalMs(fix, null, 330), 15000);
    assert.equal(movingSampleIntervalMs(fix, null, 100), 15000);
  });

  it('derives the speed from the previous fix when unreported', () => {
    const fix = buildFix(100, { timestamp: 10000 });
    const previous = { ...pointAt(0), timestamp: 0 };

    const interval = movingSampleIntervalMs(fix, previous, 2300);

    assertCloseTo(interval, 100000, 0.001);
  });

  it('assumes a walking pace without any speed signal', () => {
    const fix = buildFix(0, { speed: -1 });

    assert.equal(movingSampleIntervalMs(fix, null, 375), 50000);
  });
});

describe('trackPosition', () => {
  const emptyState = {
    anchor: null,
    stationary: false,
    previousFix: null,
    lastTrailPoint: null
  };

  it('checks in, anchors, and samples fast next to a spot', () => {
    const spot = { ...pointAt(30), id: 1 };
    const fix = buildFix(0, { timestamp: 1000 });

    const decision = trackPosition(emptyState, fix, [spot]);

    assert.deepEqual(decision.reached, [spot]);
    assert.equal(decision.extendTrail, true);
    assert.equal(decision.stationary, false);
    assert.equal(decision.sampleIntervalMs, 15000);
    assert.deepEqual(decision.anchor, {
      latitude: fix.latitude,
      longitude: fix.longitude,
      accuracy: 10,
      since: 1000
    });
  });

  it('applies the stationary backoff to a resting traveller', () => {
    const anchor = buildAnchor(0);
    const fix = buildFix(1, { timestamp: 6 * MINUTE_MS });

    const decision = trackPosition({ ...emptyState, anchor }, fix, []);

    assert.equal(decision.stationary, true);
    assert.equal(decision.sampleIntervalMs, 120000);
    assert.deepEqual(decision.reached, []);
  });

  it('returns to the moving cadence as soon as the traveller departs', () => {
    const anchor = buildAnchor(0);
    const fix = buildFix(100, { timestamp: 10 * MINUTE_MS });

    const decision = trackPosition(
      { ...emptyState, anchor, stationary: true },
      fix,
      []
    );

    assert.equal(decision.stationary, false);
    assert.equal(decision.sampleIntervalMs, 120000);
  });

  it('draws the trail from a coarse fix without checking in', () => {
    const spot = { ...pointAt(0), id: 1 };
    const fix = buildFix(0, { accuracy: 150 });

    const decision = trackPosition(emptyState, fix, [spot]);

    assert.equal(decision.extendTrail, true);
    assert.deepEqual(decision.reached, []);
    assert.equal(decision.anchor, null);
  });
});

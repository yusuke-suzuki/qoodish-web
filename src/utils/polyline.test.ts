import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { JourneyPathPoint } from '../../types';
import { decodePath, encodePath } from './polyline';

// Worked example from Google's Encoded Polyline Algorithm Format reference.
const REFERENCE_POINTS: JourneyPathPoint[] = [
  { latitude: 38.5, longitude: -120.2 },
  { latitude: 40.7, longitude: -120.95 },
  { latitude: 43.252, longitude: -126.453 }
];

const REFERENCE_ENCODED = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';

function assertPathsClose(
  actual: JourneyPathPoint[],
  expected: JourneyPathPoint[]
) {
  assert.equal(actual.length, expected.length);

  actual.forEach((point, index) => {
    // Encoding rounds coordinates to a 1e-5 grid.
    const tolerance = 0.5e-5;

    assert.ok(
      Math.abs(point.latitude - expected[index].latitude) <= tolerance,
      `latitude ${point.latitude} differs from ${expected[index].latitude}`
    );
    assert.ok(
      Math.abs(point.longitude - expected[index].longitude) <= tolerance,
      `longitude ${point.longitude} differs from ${expected[index].longitude}`
    );
  });
}

describe('encodePath', () => {
  it('matches the reference encoding', () => {
    assert.equal(encodePath(REFERENCE_POINTS), REFERENCE_ENCODED);
  });

  it('returns an empty string for an empty path', () => {
    assert.equal(encodePath([]), '');
  });
});

describe('decodePath', () => {
  it('matches the reference decoding', () => {
    assertPathsClose(decodePath(REFERENCE_ENCODED), REFERENCE_POINTS);
  });

  it('returns an empty path for null and empty input', () => {
    assert.deepEqual(decodePath(null), []);
    assert.deepEqual(decodePath(''), []);
  });
});

describe('round trip', () => {
  it('preserves a single point', () => {
    const points = [{ latitude: 35.65803, longitude: 139.74544 }];

    assert.deepEqual(decodePath(encodePath(points)), points);
  });

  it('preserves points across hemisphere boundaries', () => {
    const points = [
      { latitude: -0.00001, longitude: 0.00001 },
      { latitude: 0.00002, longitude: -0.00003 },
      { latitude: -33.86882, longitude: 151.20929 },
      { latitude: 40.71278, longitude: -74.00594 }
    ];

    assertPathsClose(decodePath(encodePath(points)), points);
  });

  it('preserves a dense trail of small deltas', () => {
    const points = Array.from({ length: 200 }, (_, index) => ({
      latitude: 35.6 + index * 0.00013,
      longitude: 139.7 - index * 0.00017
    }));

    assertPathsClose(decodePath(encodePath(points)), points);
  });
});

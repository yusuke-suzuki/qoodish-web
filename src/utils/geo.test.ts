import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assertCloseTo } from '../test/assertions.ts';
import {
  distanceInMeters,
  formatDistanceMeters,
  trailDistanceMeters
} from './geo.ts';

const EQUATOR_ONE_DEGREE_METERS = 111194.93;

describe('distanceInMeters', () => {
  it('returns zero for identical points', () => {
    const point = { latitude: 35.6812, longitude: 139.7671 };

    assert.equal(distanceInMeters(point, point), 0);
  });

  it('measures one degree of longitude along the equator', () => {
    const a = { latitude: 0, longitude: 0 };
    const b = { latitude: 0, longitude: 1 };

    assertCloseTo(distanceInMeters(a, b), EQUATOR_ONE_DEGREE_METERS, 0.01);
  });

  it('measures one degree of latitude along a meridian', () => {
    const a = { latitude: 10, longitude: 139 };
    const b = { latitude: 11, longitude: 139 };

    assertCloseTo(distanceInMeters(a, b), EQUATOR_ONE_DEGREE_METERS, 0.01);
  });

  it('is symmetric', () => {
    const a = { latitude: 35.6812, longitude: 139.7671 };
    const b = { latitude: 34.7025, longitude: 135.4959 };

    assert.equal(distanceInMeters(a, b), distanceInMeters(b, a));
  });

  it('stays finite for antipodal points', () => {
    const a = { latitude: 0, longitude: 0 };
    const b = { latitude: 0, longitude: 180 };

    const half = Math.PI * 6371000;

    assert.ok(Number.isFinite(distanceInMeters(a, b)));
    assertCloseTo(distanceInMeters(a, b), half, 0.01);
  });

  it('stays finite for near-antipodal points', () => {
    const a = { latitude: 0.0000001, longitude: 0 };
    const b = { latitude: -0.0000001, longitude: 179.9999999 };

    assert.ok(Number.isFinite(distanceInMeters(a, b)));
  });
});

describe('formatDistanceMeters', () => {
  it('formats sub-kilometer distances as whole meters', () => {
    assert.equal(formatDistanceMeters(350.4, 'en'), '350 m');
  });

  it('formats kilometer distances with one decimal', () => {
    assert.equal(formatDistanceMeters(1234, 'ja'), '1.2 km');
  });

  it('switches to kilometers when meters round up to a thousand', () => {
    assert.equal(formatDistanceMeters(999.6, 'en'), '1 km');
  });

  it('keeps zero in meters', () => {
    assert.equal(formatDistanceMeters(0, 'en'), '0 m');
  });
});

describe('trailDistanceMeters', () => {
  it('returns zero for an empty trail', () => {
    assert.equal(trailDistanceMeters([]), 0);
  });

  it('returns zero for a single point', () => {
    assert.equal(trailDistanceMeters([{ latitude: 1, longitude: 1 }]), 0);
  });

  it('sums consecutive segments', () => {
    const trail = [
      { latitude: 0, longitude: 139 },
      { latitude: 1, longitude: 139 },
      { latitude: 2, longitude: 139 }
    ];

    assertCloseTo(
      trailDistanceMeters(trail),
      EQUATOR_ONE_DEGREE_METERS * 2,
      0.01
    );
  });
});

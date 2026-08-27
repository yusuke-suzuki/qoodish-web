import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type {
  Journey,
  JourneyCheckin,
  MapFeature,
  MapFeatureCollection,
  Spot
} from '../../types/index.ts';
import { createMapFeatures, featureSpots, spotFeature } from './mapFeatures.ts';

function buildCheckin(
  id: number,
  checkedInAt: string,
  spot: Spot
): JourneyCheckin {
  return {
    id,
    review_id: id * 100,
    spot,
    checked_in_at: checkedInAt,
    note: null,
    images: []
  };
}

function buildJourney(checkins: JourneyCheckin[]): Journey {
  return {
    id: 1,
    map_id: 10,
    started_at: '2026-08-01T00:00:00Z',
    finished_at: null,
    milestones: [],
    checkins,
    encoded_path: null,
    chapter_id: null,
    map: null,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  };
}

const tower: Spot = {
  name: 'Tokyo Tower',
  latitude: 35.6586,
  longitude: 139.7454
};
const castle: Spot = {
  name: 'Osaka Castle',
  latitude: 34.6873,
  longitude: 135.5262
};

describe('spotFeature', () => {
  it('builds a Point feature with GeoJSON coordinate order', () => {
    assert.deepEqual(spotFeature(tower), {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.7454, 35.6586]
      },
      properties: { title: 'Tokyo Tower' }
    });
  });
});

describe('createMapFeatures', () => {
  it('orders features by check-in time', () => {
    const journey = buildJourney([
      buildCheckin(2, '2026-08-02T00:00:00Z', castle),
      buildCheckin(1, '2026-08-01T00:00:00Z', tower)
    ]);

    const collection = createMapFeatures(journey);

    assert.deepEqual(
      collection.features.map((feature) => feature.properties?.title),
      ['Tokyo Tower', 'Osaka Castle']
    );
  });

  it('builds an empty collection for a journey without check-ins', () => {
    assert.deepEqual(createMapFeatures(buildJourney([])), {
      type: 'FeatureCollection',
      features: []
    });
  });
});

describe('featureSpots', () => {
  it('round-trips spots through a feature collection', () => {
    const journey = buildJourney([
      buildCheckin(1, '2026-08-01T00:00:00Z', tower),
      buildCheckin(2, '2026-08-02T00:00:00Z', castle)
    ]);

    assert.deepEqual(featureSpots(createMapFeatures(journey)), [tower, castle]);
  });

  it('ignores features that are not points', () => {
    const line = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [139.7454, 35.6586],
          [135.5262, 34.6873]
        ]
      },
      properties: null
    } as unknown as MapFeature;

    const collection: MapFeatureCollection = {
      type: 'FeatureCollection',
      features: [line, spotFeature(tower)]
    };

    assert.deepEqual(featureSpots(collection), [tower]);
  });

  it('defaults a missing title to an empty name', () => {
    const collection: MapFeatureCollection = {
      type: 'FeatureCollection',
      features: [{ ...spotFeature(tower), properties: null }]
    };

    assert.deepEqual(featureSpots(collection), [{ ...tower, name: '' }]);
  });

  it('tolerates a collection without a features array', () => {
    const collection = {
      type: 'FeatureCollection'
    } as MapFeatureCollection;

    assert.deepEqual(featureSpots(collection), []);
  });
});

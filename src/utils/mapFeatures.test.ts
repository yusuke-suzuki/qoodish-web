import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type {
  Journey,
  JourneyCheckin,
  MapFeature,
  MapFeatureCollection,
  Spot
} from '../../types/index.ts';
import { buildCheckin, buildJourney } from '../test/journeys.ts';
import { createMapFeatures, featureSpots, spotFeature } from './mapFeatures.ts';

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
      buildCheckin(2, '2026-08-02T00:00:00Z', { spot: castle }),
      buildCheckin(1, '2026-08-01T00:00:00Z', { spot: tower })
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
      buildCheckin(1, '2026-08-01T00:00:00Z', { spot: tower }),
      buildCheckin(2, '2026-08-02T00:00:00Z', { spot: castle })
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

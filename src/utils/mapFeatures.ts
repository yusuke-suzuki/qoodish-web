import type {
  Journey,
  MapFeature,
  MapFeatureCollection,
  Spot
} from '../../types/index.ts';

export function spotFeature(spot: Spot): MapFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [spot.longitude, spot.latitude]
    },
    properties: { title: spot.name }
  };
}

export function createMapFeatures(journey: Journey): MapFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: journey.checkins
      .toSorted((a, b) => a.checked_in_at.localeCompare(b.checked_in_at))
      .map((checkin) => spotFeature(checkin.spot))
  };
}

export function featureSpots(collection: MapFeatureCollection): Spot[] {
  return (collection.features ?? [])
    .filter((feature) => feature.geometry?.type === 'Point')
    .map((feature) => ({
      name: feature.properties?.title ?? '',
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1]
    }));
}

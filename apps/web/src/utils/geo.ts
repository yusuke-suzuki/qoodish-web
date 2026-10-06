type LatLng = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_METERS = 6371000;

export function trailDistanceMeters(points: LatLng[]): number {
  let meters = 0;

  for (let index = 1; index < points.length; index += 1) {
    meters += distanceInMeters(points[index - 1], points[index]);
  }

  return meters;
}

export function formatDistanceMeters(meters: number, locale: string): string {
  if (Math.round(meters) < 1000) {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'meter',
      maximumFractionDigits: 0
    }).format(meters);
  }

  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'kilometer',
    maximumFractionDigits: 1
  }).format(meters / 1000);
}

export function distanceInMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLng * sinLng;

  // Rounding can push h just past 1 for near-antipodal points, which would
  // make asin return NaN.
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, h)));
}

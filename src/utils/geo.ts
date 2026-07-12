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

export function distanceInMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLng * sinLng;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

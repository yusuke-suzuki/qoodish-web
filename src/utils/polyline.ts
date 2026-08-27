import type { JourneyPathPoint } from '../../types/index.ts';

function encodeValue(value: number, output: string[]): void {
  let coded = value < 0 ? ~(value << 1) : value << 1;

  while (coded >= 0x20) {
    output.push(String.fromCharCode((0x20 | (coded & 0x1f)) + 63));
    coded >>= 5;
  }

  output.push(String.fromCharCode(coded + 63));
}

export function encodePath(points: JourneyPathPoint[]): string {
  const output: string[] = [];
  let previousLat = 0;
  let previousLng = 0;

  for (const point of points) {
    const lat = Math.round(point.latitude * 1e5);
    const lng = Math.round(point.longitude * 1e5);

    encodeValue(lat - previousLat, output);
    encodeValue(lng - previousLng, output);

    previousLat = lat;
    previousLng = lng;
  }

  return output.join('');
}

export function decodePath(encoded: string | null): JourneyPathPoint[] {
  if (!encoded) {
    return [];
  }

  const points: JourneyPathPoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    for (const axis of ['lat', 'lng'] as const) {
      let result = 0;
      let shift = 0;
      let byte = 0x20;

      while (byte >= 0x20) {
        byte = encoded.charCodeAt(index) - 63;
        index++;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      }

      const delta = result & 1 ? ~(result >> 1) : result >> 1;

      if (axis === 'lat') {
        lat += delta;
      } else {
        lng += delta;
      }
    }

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

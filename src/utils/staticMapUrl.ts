type Options = {
  width: number;
  height: number;
  zoom?: number;
};

export default function staticMapUrl(
  latitude: number,
  longitude: number,
  { width, height, zoom = 15 }: Options
): string {
  const params = new URLSearchParams({
    center: `${latitude},${longitude}`,
    markers: `color:red|${latitude},${longitude}`,
    zoom: String(zoom),
    size: `${width}x${height}`,
    scale: '2',
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
  });

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

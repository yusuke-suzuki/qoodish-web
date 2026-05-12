import type { MetadataRoute } from 'next';

const ICON_BASE_URL =
  'https://storage.googleapis.com/qoodish.appspot.com/assets';

const ICON_SIZES = ['48', '72', '96', '128', '192', '384', '512'] as const;

const icons: MetadataRoute.Manifest['icons'] = ICON_SIZES.flatMap((size) => {
  const src = `${ICON_BASE_URL}/maskable_icon_x${size}.png`;
  const sizes = `${size}x${size}`;

  return [
    { src, sizes, type: 'image/png', purpose: 'any' },
    { src, sizes, type: 'image/png', purpose: 'maskable' }
  ];
});

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Qoodish',
    short_name: 'Qoodish',
    start_url: '/?utm_source=homescreen',
    display: 'standalone',
    theme_color: '#ffc107',
    background_color: '#f1f1f1',
    orientation: 'portrait',
    icons
  };
}

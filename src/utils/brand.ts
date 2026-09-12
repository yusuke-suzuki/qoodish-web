// amber[800] and the contrast text MUI computes for it, repeated as literals
// for the surfaces that cannot read the theme: the manifest, the viewport's
// theme-color, and the two global error documents. Those two render when the
// app itself has failed and are deliberately free of the component library, so
// they cannot reach for the palette either. Keep in step with `Providers.tsx`.
export const BRAND_COLOR = '#ff8f00';

export const BRAND_COLOR_CONTRAST = 'rgba(0, 0, 0, 0.87)';

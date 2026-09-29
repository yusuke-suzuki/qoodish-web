import type { Viewport } from 'next';

// amber[600] and the contrast text MUI computes for it, as literals for the
// surfaces that cannot reach the theme: the manifest, the theme-color meta and
// the global error documents, which render without the component library.
// Keep in step with `theme.ts`.
export const BRAND_COLOR = '#ffb300';

export const BRAND_COLOR_CONTRAST = 'rgba(0, 0, 0, 0.87)';

export const DARK_BACKGROUND = '#121212';

export const THEME_COLOR: Viewport['themeColor'] = [
  { media: '(prefers-color-scheme: light)', color: BRAND_COLOR },
  { media: '(prefers-color-scheme: dark)', color: DARK_BACKGROUND }
];

// Kept in step with Article 17 of the terms, which publishes the same address.
export const SUPPORT_EMAIL = 'support@qoodish.com';

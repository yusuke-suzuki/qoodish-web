import { isLocale, type Locale } from './i18n/index.ts';

export const ICON_SIZES = [
  16, 32, 48, 72, 96, 128, 152, 167, 180, 192, 384, 512
] as const;

export type IconSize = (typeof ICON_SIZES)[number];

export const OG_IMAGE_WIDTH = 1200;

export const OG_IMAGE_HEIGHT = 630;

export type Asset =
  | { kind: 'icon'; size: IconSize }
  | { kind: 'ogImage'; locale: Locale };

function isIconSize(value: number): value is IconSize {
  return ICON_SIZES.includes(value as IconSize);
}

export function assetFileName(asset: Asset): string {
  return asset.kind === 'icon'
    ? `icon_x${asset.size}.png`
    : `ogp-image-${asset.locale}.png`;
}

export function parseAssetFileName(name: string): Asset | null {
  const icon = /^icon_x(\d+)\.png$/.exec(name);

  if (icon) {
    const size = Number(icon[1]);

    return isIconSize(size) ? { kind: 'icon', size } : null;
  }

  const ogImage = /^ogp-image-([a-z]+)\.png$/.exec(name);

  if (ogImage && isLocale(ogImage[1])) {
    return { kind: 'ogImage', locale: ogImage[1] };
  }

  return null;
}

export function assetViewport(asset: Asset): { width: number; height: number } {
  return asset.kind === 'icon'
    ? { width: asset.size, height: asset.size }
    : { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT };
}

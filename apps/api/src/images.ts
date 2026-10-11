import type { Image, ImageVariants } from '@qoodish/api-contract';

export function variantUrl(url: string, variant: string): string {
  return url.replace(/\/[^/]+$/, `/${variant}`);
}

function variants(url: string): Omit<ImageVariants, 'url'> {
  return {
    avatar: variantUrl(url, 'avatar'),
    card: variantUrl(url, 'card'),
    hero: variantUrl(url, 'hero'),
    ogp: variantUrl(url, 'ogp')
  };
}

export function imageVariants(url: string): ImageVariants {
  return { ...variants(url), url };
}

export function image(id: number, url: string): Image {
  return { id, url, ...variants(url) };
}

export function primaryImage(url: string | undefined): {
  image: ImageVariants | null;
  image_url: string;
} {
  return url === undefined
    ? { image: null, image_url: '' }
    : { image: imageVariants(url), image_url: url };
}

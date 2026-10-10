import type { Image, ImageVariants } from '@qoodish/api-contract';

export function variantUrl(url: string, variant: string): string {
  return url.replace(/\/[^/]+$/, `/${variant}`);
}

export function imageVariants(url: string): ImageVariants {
  return {
    avatar: variantUrl(url, 'avatar'),
    card: variantUrl(url, 'card'),
    hero: variantUrl(url, 'hero'),
    ogp: variantUrl(url, 'ogp'),
    url
  };
}

export function image(id: number, url: string): Image {
  return {
    id,
    url,
    avatar: variantUrl(url, 'avatar'),
    card: variantUrl(url, 'card'),
    hero: variantUrl(url, 'hero'),
    ogp: variantUrl(url, 'ogp')
  };
}

export function primaryImage(url: string | undefined): {
  image: ImageVariants | null;
  image_url: string;
} {
  return url === undefined
    ? { image: null, image_url: '' }
    : { image: imageVariants(url), image_url: url };
}

import type { Image, ImageVariants } from '@qoodish/api-contract';
import { type Database, inIds } from './db/client.ts';
import { images } from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { MessageKey } from './i18n/index.ts';

export function sameIds(
  left: readonly number[],
  right: readonly number[]
): boolean {
  const remaining = new Set(right);

  return (
    left.length === remaining.size && left.every((id) => remaining.delete(id))
  );
}

export async function unownedImageErrors(
  db: Database,
  imageIds: readonly number[],
  editorId: number
): Promise<MessageKey[]> {
  if (imageIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({ userId: images.userId })
    .from(images)
    .where(inIds(images.id, imageIds));

  if (rows.length !== imageIds.length) {
    throw new ApiError('NotFound');
  }

  return rows.every((row) => row.userId === editorId)
    ? []
    : ['image_not_owned'];
}

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

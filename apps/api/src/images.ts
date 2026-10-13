import type { Image, ImageVariants } from '@qoodish/api-contract';
import { and, inArray, type SQLWrapper } from 'drizzle-orm';
import { currentTimestamp, type Database, inIds } from './db/client.ts';
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

export function imageOwnersQuery(db: Database, imageIds: readonly number[]) {
  return db
    .select({ userId: images.userId })
    .from(images)
    .where(inIds(images.id, imageIds));
}

export function unownedImages(
  owners: readonly { userId: number }[],
  imageIds: readonly number[],
  editorId: number
): MessageKey[] {
  if (owners.length !== imageIds.length) {
    throw new ApiError('NotFound');
  }

  return owners.every((owner) => owner.userId === editorId)
    ? []
    : ['image_not_owned'];
}

export async function unownedImageErrors(
  db: Database,
  imageIds: readonly number[],
  editorId: number
): Promise<MessageKey[]> {
  if (imageIds.length === 0) {
    return [];
  }

  return unownedImages(
    await imageOwnersQuery(db, imageIds),
    imageIds,
    editorId
  );
}

export async function createImage(
  db: Database,
  { userId, url }: { userId: number; url: string }
): Promise<number> {
  const now = currentTimestamp();
  const created = await db
    .insert(images)
    .values({ userId, url, createdAt: now, updatedAt: now })
    .returning({ id: images.id })
    .get();

  return created.id;
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

export function imagesDeletion(
  db: Database,
  imageIds: SQLWrapper,
  readImageIds: readonly number[]
) {
  return db
    .delete(images)
    .where(and(inArray(images.id, imageIds), inIds(images.id, readImageIds)));
}

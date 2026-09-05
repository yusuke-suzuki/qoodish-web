import type { Image, ImageVariants } from '../../types/index.ts';

type DirectUploadAllocation = {
  upload_url: string;
  id: number;
};

type CloudflareUploadResponse = {
  result: {
    id: string;
    variants: string[];
  };
  success: boolean;
};

// Cloudflare Images rejects hosted uploads above this size, so oversized files
// are filtered out before an upload URL is allocated for them.
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;

export function splitOversizedImages(files: File[]): {
  accepted: File[];
  oversized: File[];
} {
  const accepted: File[] = [];
  const oversized: File[] = [];

  for (const file of files) {
    (file.size > MAX_IMAGE_FILE_SIZE ? oversized : accepted).push(file);
  }

  return { accepted, oversized };
}

// The Rails `image` payload keys the full-size URL as `url`, but the matching
// Cloudflare variant is the built-in `public`; the sized variants share their
// names. Only `url` needs translation.
const VARIANT_BY_KEY: Record<keyof ImageVariants, string> = {
  url: 'public',
  avatar: 'avatar',
  card: 'card',
  hero: 'hero',
  ogp: 'ogp'
};

export function buildVariants(urls: string[]): ImageVariants {
  const byName = new Map<string, string>();
  for (const url of urls) {
    const name = url.split('/').pop();
    if (name) {
      byName.set(name, url);
    }
  }

  const variants = {} as ImageVariants;
  for (const key of Object.keys(VARIANT_BY_KEY) as (keyof ImageVariants)[]) {
    const variantName = VARIANT_BY_KEY[key];
    const url = byName.get(variantName);
    if (!url) {
      throw new Error(
        `Cloudflare Images variant "${variantName}" is not configured`
      );
    }
    variants[key] = url;
  }
  return variants;
}

export default async function uploadImage(file: File): Promise<Image> {
  const allocRes = await fetch('/api/v1/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  });
  if (!allocRes.ok) {
    throw new Error('Failed to allocate upload URL');
  }
  const { upload_url: uploadUrl, id }: DirectUploadAllocation =
    await allocRes.json();

  const form = new FormData();
  form.append('file', file, file.name);

  const cfRes = await fetch(uploadUrl, { method: 'POST', body: form });
  if (!cfRes.ok) {
    throw new Error('Failed to upload image to Cloudflare Images');
  }
  const { result, success }: CloudflareUploadResponse = await cfRes.json();
  if (!success) {
    throw new Error('Cloudflare Images upload reported failure');
  }

  return { id, ...buildVariants(result.variants) };
}

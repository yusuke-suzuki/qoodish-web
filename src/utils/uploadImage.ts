import type { Image } from '../../types';
import dataUrlToBlob from './dataUrlToBlob';

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

const VARIANT_NAMES = ['url', 'avatar', 'card', 'hero', 'ogp'] as const;
type VariantName = (typeof VARIANT_NAMES)[number];

function buildVariants(urls: string[]): Record<VariantName, string> {
  const byName = new Map<string, string>();
  for (const url of urls) {
    const name = url.split('/').pop();
    if (name) {
      byName.set(name, url);
    }
  }

  const variants = {} as Record<VariantName, string>;
  for (const name of VARIANT_NAMES) {
    const url = byName.get(name);
    if (!url) {
      throw new Error(`Cloudflare Images variant "${name}" is not configured`);
    }
    variants[name] = url;
  }
  return variants;
}

export default async function uploadImage(dataUrl: string): Promise<Image> {
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

  const blob = await dataUrlToBlob(dataUrl);
  const ext = blob.type.split('/')[1] ?? 'bin';
  const form = new FormData();
  form.append('file', blob, `${id}.${ext}`);

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

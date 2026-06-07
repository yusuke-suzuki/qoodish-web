import dataUrlToBlob from './dataUrlToBlob';

type DirectUploadAllocation = {
  uploadURL: string;
  id: number;
};

type CloudflareUploadResponse = {
  result: {
    id: string;
    variants: string[];
  };
  success: boolean;
};

export type UploadedImage = {
  id: number;
  url: string;
};

export default async function uploadImage(
  dataUrl: string
): Promise<UploadedImage> {
  const allocRes = await fetch('/api/v1/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  });
  if (!allocRes.ok) {
    throw new Error('Failed to allocate upload URL');
  }
  const { uploadURL, id }: DirectUploadAllocation = await allocRes.json();

  const blob = await dataUrlToBlob(dataUrl);
  const ext = blob.type.split('/')[1] ?? 'bin';
  const form = new FormData();
  form.append('file', blob, `${id}.${ext}`);

  const cfRes = await fetch(uploadURL, { method: 'POST', body: form });
  if (!cfRes.ok) {
    throw new Error('Failed to upload image to Cloudflare Images');
  }
  const { result, success }: CloudflareUploadResponse = await cfRes.json();
  if (!success || result.variants.length === 0) {
    throw new Error('Cloudflare Images upload reported failure');
  }

  return { id, url: result.variants[0] };
}

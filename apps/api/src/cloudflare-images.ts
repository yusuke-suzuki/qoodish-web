import { z } from 'zod';
import type { Env } from './env.ts';

const CLOUDFLARE_API_ENDPOINT = 'https://api.cloudflare.com';
const DELIVERY_HOST = 'imagedelivery.net';
const SERVICE_IDENTIFIER = 'qoodish';
const TIMEOUT_MS = 10_000;

type ImagesEnv = Pick<
  Env,
  | 'APP_ENV'
  | 'CLOUDFLARE_ACCOUNT_ID'
  | 'CLOUDFLARE_IMAGES_ACCOUNT_HASH'
  | 'CLOUDFLARE_IMAGES_API_TOKEN'
>;

const directUploadResponse = z.object({
  success: z.literal(true),
  result: z.object({ id: z.string(), uploadURL: z.string() })
});

export type DirectUpload = { url: string; uploadUrl: string };

function parsedJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function deliveryUrl(env: ImagesEnv, imageId: string): string {
  return `https://${DELIVERY_HOST}/${env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${imageId}/public`;
}

export async function createDirectUpload(
  env: ImagesEnv
): Promise<DirectUpload> {
  const form = new FormData();
  form.set('id', `${SERVICE_IDENTIFIER}/${crypto.randomUUID()}`);
  form.set(
    'metadata',
    JSON.stringify({ app: SERVICE_IDENTIFIER, env: env.APP_ENV })
  );

  const response = await fetch(
    `${CLOUDFLARE_API_ENDPOINT}/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${env.CLOUDFLARE_IMAGES_API_TOKEN}` },
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS)
    }
  ).catch((cause: unknown) => {
    throw new Error('Cloudflare Images direct upload failed', { cause });
  });
  const body = await response.text();
  const parsed = directUploadResponse.safeParse(
    response.ok ? parsedJson(body) : undefined
  );

  if (!parsed.success) {
    throw new Error(
      `Cloudflare Images direct upload answered ${response.status}: ${body}`
    );
  }

  return {
    url: deliveryUrl(env, parsed.data.result.id),
    uploadUrl: parsed.data.result.uploadURL
  };
}

export function cloudflareImageId(
  env: Pick<Env, 'CLOUDFLARE_IMAGES_ACCOUNT_HASH'>,
  url: string
): string | undefined {
  const parsed = URL.parse(url);

  if (parsed?.hostname !== DELIVERY_HOST) {
    return undefined;
  }

  const [accountHash, ...rest] = parsed.pathname.split('/').filter(Boolean);

  if (accountHash !== env.CLOUDFLARE_IMAGES_ACCOUNT_HASH || rest.length < 2) {
    return undefined;
  }

  return rest.slice(0, -1).join('/');
}

export async function deleteCloudflareImage(
  env: ImagesEnv,
  imageId: string
): Promise<void> {
  const response = await fetch(
    `${CLOUDFLARE_API_ENDPOINT}/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
    {
      method: 'DELETE',
      headers: { authorization: `Bearer ${env.CLOUDFLARE_IMAGES_API_TOKEN}` },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    }
  );

  if (response.status === 404) {
    console.warn(`Cloudflare image ${imageId} was already deleted`);
    return;
  }

  if (!response.ok) {
    throw new Error(
      `Cloudflare Images deletion of ${imageId} answered ${response.status}: ${await response.text()}`
    );
  }
}

import { z } from 'zod';
import type { Env } from '../env.ts';
import {
  forgetServiceAccountToken,
  serviceAccountOf,
  serviceAccountToken
} from './service-account.ts';

export const DELETE_ACCOUNT_URL =
  'https://identitytoolkit.googleapis.com/v1/accounts:delete';

const CLOUD_PLATFORM_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const TIMEOUT_MS = 10_000;

const errorResponse = z.object({ error: z.object({ message: z.string() }) });

export async function deleteIdentityPlatformAccount(
  env: Pick<
    Env,
    'GOOGLE_CLIENT_EMAIL' | 'GOOGLE_PRIVATE_KEY' | 'GOOGLE_PROJECT_ID'
  >,
  uid: string
): Promise<void> {
  const serviceAccount = serviceAccountOf(env);
  const accessToken = await serviceAccountToken(
    serviceAccount,
    CLOUD_PLATFORM_SCOPE
  );
  const response = await fetch(DELETE_ACCOUNT_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      localId: uid,
      targetProjectId: env.GOOGLE_PROJECT_ID
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });

  if (response.ok) {
    return;
  }

  if (response.status === 401) {
    forgetServiceAccountToken(serviceAccount, CLOUD_PLATFORM_SCOPE);
  }

  const body: unknown = await response.json().catch(() => undefined);
  const parsed = errorResponse.safeParse(body);

  if (parsed.success && parsed.data.error.message === 'USER_NOT_FOUND') {
    console.warn(`Identity Platform account ${uid} was already deleted`);
    return;
  }

  throw new Error(
    `Identity Platform answered ${response.status}: ${JSON.stringify(body)}`
  );
}

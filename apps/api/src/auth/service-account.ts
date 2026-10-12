import { importPKCS8, SignJWT } from 'jose';
import { z } from 'zod';

export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

const REQUEST_TIMEOUT_MS = 10_000;
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

export type ServiceAccount = { clientEmail: string; privateKey: string };

const tokenResponse = z.object({
  access_token: z.string(),
  expires_in: z.number()
});

const cachedTokens = new Map<string, { token: string; expiresAt: number }>();

function unescapedNewlines(pem: string): string {
  return pem.replaceAll('\\n', '\n');
}

async function requestToken(account: ServiceAccount, scope: string) {
  const assertion = await new SignJWT({ scope })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(account.clientEmail)
    .setAudience(GOOGLE_TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(await importPKCS8(unescapedNewlines(account.privateKey), 'RS256'));
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Google token endpoint answered ${response.status}`);
  }

  return tokenResponse.parse(await response.json());
}

function cacheKeyOf(account: ServiceAccount, scope: string): string {
  return JSON.stringify([account.clientEmail, account.privateKey, scope]);
}

export function forgetServiceAccountToken(
  account: ServiceAccount,
  scope: string
) {
  cachedTokens.delete(cacheKeyOf(account, scope));
}

export async function serviceAccountToken(
  account: ServiceAccount,
  scope: string
): Promise<string> {
  const cacheKey = cacheKeyOf(account, scope);
  const cached = cachedTokens.get(cacheKey);

  if (cached && cached.expiresAt - REFRESH_MARGIN_MS > Date.now()) {
    return cached.token;
  }

  const { access_token, expires_in } = await requestToken(account, scope);

  cachedTokens.set(cacheKey, {
    token: access_token,
    expiresAt: Date.now() + expires_in * 1000
  });

  return access_token;
}

const KEYS_TTL_MS = 60 * 60 * 1000;
const KEYS_MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const KEYS_RETRY_AFTER_FAILURE_MS = 30 * 1000;
const KEYS_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const KEYS_FETCH_TIMEOUT_MS = 5000;

const SIGNATURE_ALGORITHM = {
  name: 'RSASSA-PKCS1-v1_5',
  hash: 'SHA-256'
} as const;

export type SigningKey = JsonWebKey & { kid?: string };

export type KeysFetcher = (refresh: boolean) => Promise<SigningKey[]>;

export type JwtPayload = {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  [claim: string]: unknown;
};

type JwtHeader = { alg?: string; kid?: string };

type KeyCache = {
  keys: SigningKey[];
  fetchedAt: number;
  attemptedAt: number;
  failed: boolean;
  pending?: Promise<SigningKey[]>;
};

export function createKeysFetcher(url: string): KeysFetcher {
  const cache: KeyCache = {
    keys: [],
    fetchedAt: 0,
    attemptedAt: 0,
    failed: false
  };

  const unexpiredKeys = () =>
    Date.now() - cache.fetchedAt < KEYS_MAX_AGE_MS ? cache.keys : [];

  const usable = (refresh: boolean) => {
    const age = Date.now() - cache.attemptedAt;

    if (cache.failed) {
      return age < KEYS_RETRY_AFTER_FAILURE_MS;
    }

    if (refresh || cache.keys.length === 0) {
      return age < KEYS_MIN_REFRESH_INTERVAL_MS;
    }

    return age < KEYS_TTL_MS;
  };

  const request = async (): Promise<SigningKey[]> => {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(KEYS_FETCH_TIMEOUT_MS)
      });

      if (!res.ok) {
        throw new Error(
          `Signing keys request failed with status ${res.status}`
        );
      }

      const { keys } = (await res.json()) as { keys: SigningKey[] };
      const now = Date.now();
      cache.keys = keys;
      cache.fetchedAt = now;
      cache.attemptedAt = now;
      cache.failed = false;

      return keys;
    } catch (error) {
      cache.attemptedAt = Date.now();
      cache.failed = true;
      const fallback = unexpiredKeys();

      if (fallback.length === 0) {
        throw error;
      }

      console.warn(
        `Signing keys fetch failed; keeping the cached keys: ${String(error)}`
      );
      return fallback;
    }
  };

  return async (refresh) => {
    if (usable(refresh)) {
      return unexpiredKeys();
    }

    if (cache.pending) {
      return cache.pending;
    }

    const pending = request().finally(() => {
      if (cache.pending === pending) {
        cache.pending = undefined;
      }
    });
    cache.pending = pending;

    return pending;
  };
}

function decodeBase64Url(segment: string): Uint8Array<ArrayBuffer> {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJson<T>(segment: string): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(segment)));
}

async function findKey(
  kid: string,
  fetchKeys: KeysFetcher
): Promise<SigningKey | undefined> {
  const keys = await fetchKeys(false);
  const key = keys.find((candidate) => candidate.kid === kid);

  if (key) {
    return key;
  }

  const refreshed = await fetchKeys(true);
  return refreshed.find((candidate) => candidate.kid === kid);
}

export type Claims = {
  issuer: string;
  audience: string;
};

function claimsAreValid(
  payload: JwtPayload,
  claims: Claims,
  now: number
): boolean {
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

  return (
    payload.iss === claims.issuer &&
    audiences.includes(claims.audience) &&
    typeof payload.sub === 'string' &&
    payload.sub.length > 0 &&
    typeof payload.exp === 'number' &&
    payload.exp * 1000 > now &&
    (payload.nbf === undefined || payload.nbf * 1000 <= now) &&
    (payload.iat === undefined || payload.iat * 1000 <= now)
  );
}

export async function verifyRs256Jwt(
  token: string,
  claims: Claims,
  fetchKeys: KeysFetcher,
  now: number = Date.now()
): Promise<JwtPayload | null> {
  const [encodedHeader, encodedPayload, encodedSignature, ...rest] =
    token.split('.');

  if (!encodedHeader || !encodedPayload || !encodedSignature || rest.length) {
    return null;
  }

  try {
    const header = decodeJson<JwtHeader>(encodedHeader);

    if (header.alg !== 'RS256' || !header.kid) {
      return null;
    }

    const jwk = await findKey(header.kid, fetchKeys);

    if (!jwk) {
      return null;
    }

    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      SIGNATURE_ALGORITHM,
      false,
      ['verify']
    );
    const signed = await crypto.subtle.verify(
      SIGNATURE_ALGORITHM,
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!signed) {
      return null;
    }

    const payload = decodeJson<JwtPayload>(encodedPayload);

    return claimsAreValid(payload, claims, now) ? payload : null;
  } catch (error) {
    console.warn(`JWT verification failed: ${String(error)}`);
    return null;
  }
}

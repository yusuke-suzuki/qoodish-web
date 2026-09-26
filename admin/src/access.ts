export const ACCESS_JWT_HEADER = 'cf-access-jwt-assertion';

const KEYS_TTL_MS = 60 * 60 * 1000;
const KEYS_MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const KEYS_FETCH_TIMEOUT_MS = 5000;

const SIGNATURE_ALGORITHM = {
  name: 'RSASSA-PKCS1-v1_5',
  hash: 'SHA-256'
} as const;

type AccessKey = JsonWebKey & { kid?: string };

export type AccessConfig = {
  teamDomain: string;
  audience: string;
};

export type AccessKeysFetcher = (
  teamDomain: string,
  refresh: boolean
) => Promise<AccessKey[]>;

type JwtHeader = { alg?: string; kid?: string };

type JwtPayload = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
};

let cachedKeys: {
  teamDomain: string;
  keys: AccessKey[];
  attemptedAt: number;
} = { teamDomain: '', keys: [], attemptedAt: 0 };

let pendingFetch:
  | { teamDomain: string; promise: Promise<AccessKey[]> }
  | undefined;

function issuerOf(teamDomain: string): string {
  return `https://${teamDomain}`;
}

function keysAreUsable(teamDomain: string, refresh: boolean): boolean {
  if (cachedKeys.teamDomain !== teamDomain) {
    return false;
  }

  const age = Date.now() - cachedKeys.attemptedAt;

  if (refresh || cachedKeys.keys.length === 0) {
    return age < KEYS_MIN_REFRESH_INTERVAL_MS;
  }

  return age < KEYS_TTL_MS;
}

export async function fetchAccessKeys(
  teamDomain: string,
  refresh: boolean
): Promise<AccessKey[]> {
  if (keysAreUsable(teamDomain, refresh)) {
    return cachedKeys.keys;
  }

  if (pendingFetch?.teamDomain === teamDomain) {
    return pendingFetch.promise;
  }

  const promise = requestAccessKeys(teamDomain).finally(() => {
    if (pendingFetch?.promise === promise) {
      pendingFetch = undefined;
    }
  });
  pendingFetch = { teamDomain, promise };

  return promise;
}

async function requestAccessKeys(teamDomain: string): Promise<AccessKey[]> {
  const previousKeys =
    cachedKeys.teamDomain === teamDomain ? cachedKeys.keys : [];

  try {
    const res = await fetch(`${issuerOf(teamDomain)}/cdn-cgi/access/certs`, {
      signal: AbortSignal.timeout(KEYS_FETCH_TIMEOUT_MS)
    });

    if (!res.ok) {
      throw new Error(`Access certs request failed with status ${res.status}`);
    }

    const { keys } = (await res.json()) as { keys: AccessKey[] };
    cachedKeys = { teamDomain, keys, attemptedAt: Date.now() };

    return keys;
  } catch (error) {
    cachedKeys = { teamDomain, keys: previousKeys, attemptedAt: Date.now() };
    throw error;
  }
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
  teamDomain: string,
  fetchKeys: AccessKeysFetcher
): Promise<AccessKey | undefined> {
  const keys = await fetchKeys(teamDomain, false);
  const key = keys.find((candidate) => candidate.kid === kid);

  if (key) {
    return key;
  }

  const refreshed = await fetchKeys(teamDomain, true);
  return refreshed.find((candidate) => candidate.kid === kid);
}

function claimsAreValid(
  payload: JwtPayload,
  config: AccessConfig,
  now: number
): boolean {
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

  return (
    payload.iss === issuerOf(config.teamDomain) &&
    audiences.includes(config.audience) &&
    typeof payload.exp === 'number' &&
    payload.exp * 1000 > now &&
    (payload.nbf === undefined || payload.nbf * 1000 <= now)
  );
}

export async function verifyAccessJwt(
  token: string,
  config: AccessConfig,
  fetchKeys: AccessKeysFetcher = fetchAccessKeys,
  now: number = Date.now()
): Promise<boolean> {
  const [encodedHeader, encodedPayload, encodedSignature, ...rest] =
    token.split('.');

  if (!encodedHeader || !encodedPayload || !encodedSignature || rest.length) {
    return false;
  }

  try {
    const header = decodeJson<JwtHeader>(encodedHeader);

    if (header.alg !== 'RS256' || !header.kid) {
      return false;
    }

    const jwk = await findKey(header.kid, config.teamDomain, fetchKeys);

    if (!jwk) {
      return false;
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

    return (
      signed &&
      claimsAreValid(decodeJson<JwtPayload>(encodedPayload), config, now)
    );
  } catch (error) {
    console.warn(`Access JWT verification failed: ${String(error)}`);
    return false;
  }
}

export async function hasAccess(
  token: string | undefined,
  config: Partial<AccessConfig>
): Promise<boolean> {
  const { teamDomain, audience } = config;

  if (!teamDomain || !audience || !token) {
    return false;
  }

  return verifyAccessJwt(token, { teamDomain, audience });
}

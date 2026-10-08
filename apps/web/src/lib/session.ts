import describeError from '../utils/describeError.ts';

export const SESSION_COOKIE = '__session';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
const RENEWAL_MARGIN_SECONDS = 60;
const RENEWAL_TIMEOUT_MS = 5000;
const REVOKED_REFRESH_TOKEN_ERRORS = new Set([
  'TOKEN_EXPIRED',
  'USER_DISABLED',
  'USER_NOT_FOUND',
  'INVALID_REFRESH_TOKEN'
]);

type CookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
};

export type SessionCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export type Renewal =
  | { status: 'renewed'; idToken: string; refreshToken: string }
  | { status: 'revoked' }
  | { status: 'unavailable' };

function cookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge
  };
}

export function idTokenExpiresAt(idToken: string): number | null {
  const payload = idToken.split('.')[1];

  if (!payload) {
    return null;
  }

  try {
    const binary = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(binary, (char) => char.charCodeAt(0))
      )
    );

    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

export function needsRenewal(
  idToken: string | undefined,
  now = Date.now()
): boolean {
  const expiresAt = idToken ? idTokenExpiresAt(idToken) : null;

  return expiresAt === null || expiresAt - now / 1000 < RENEWAL_MARGIN_SECONDS;
}

export function sessionCookies(
  idToken: string,
  refreshToken: string | null,
  now = Date.now()
): SessionCookie[] {
  const expiresAt = idTokenExpiresAt(idToken) ?? 0;

  return [
    {
      name: SESSION_COOKIE,
      value: idToken,
      options: cookieOptions(Math.max(0, Math.floor(expiresAt - now / 1000)))
    },
    {
      name: REFRESH_TOKEN_COOKIE,
      value: refreshToken ?? '',
      options: cookieOptions(refreshToken ? REFRESH_TOKEN_MAX_AGE : 0)
    }
  ];
}

export function clearedSessionCookies(): SessionCookie[] {
  return [SESSION_COOKIE, REFRESH_TOKEN_COOKIE].map((name) => ({
    name,
    value: '',
    options: cookieOptions(0)
  }));
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const { error } = await response.json();

    return typeof error?.message === 'string' ? error.message : '';
  } catch {
    return '';
  }
}

export async function renewIdToken(refreshToken: string): Promise<Renewal> {
  try {
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        signal: AbortSignal.timeout(RENEWAL_TIMEOUT_MS)
      }
    );

    if (
      response.status === 400 &&
      REVOKED_REFRESH_TOKEN_ERRORS.has(await errorMessage(response))
    ) {
      return { status: 'revoked' };
    }

    if (!response.ok) {
      console.warn(`ID token renewal failed with status ${response.status}`);
      return { status: 'unavailable' };
    }

    const { id_token: idToken, refresh_token: renewedRefreshToken } =
      await response.json();

    if (
      typeof idToken !== 'string' ||
      typeof renewedRefreshToken !== 'string'
    ) {
      return { status: 'unavailable' };
    }

    return { status: 'renewed', idToken, refreshToken: renewedRefreshToken };
  } catch (error) {
    console.warn(`ID token renewal failed: ${describeError(error)}`);
    return { status: 'unavailable' };
  }
}

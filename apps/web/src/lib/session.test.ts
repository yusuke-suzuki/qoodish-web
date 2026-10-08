import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  clearedSessionCookies,
  idTokenExpiresAt,
  needsRenewal,
  REFRESH_TOKEN_COOKIE,
  renewIdToken,
  SESSION_COOKIE,
  sessionCookies
} from './session.ts';

type FetchArgs = [input: string | URL | Request, init?: RequestInit];

const NOW = Date.UTC(2026, 9, 8, 12, 0, 0);
const NOW_SECONDS = NOW / 1000;

function idTokenWith(payload: Record<string, unknown>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const encoded = btoa(
    Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `header.${encoded}.signature`;
}

describe('idTokenExpiresAt', () => {
  it('reads the expiry from the token payload', () => {
    assert.equal(
      idTokenExpiresAt(idTokenWith({ exp: 1700000000 })),
      1700000000
    );
  });

  it('reads a payload that needs base64url characters', () => {
    const token = idTokenWith({
      exp: 1700000000,
      name: '\u3059\u305a\u304d???>>>'
    });

    assert.match(token.split('.')[1], /[-_]/);
    assert.equal(idTokenExpiresAt(token), 1700000000);
  });

  it('gives no expiry for a malformed token', () => {
    assert.equal(idTokenExpiresAt('not-a-token'), null);
    assert.equal(idTokenExpiresAt('header.!!!.signature'), null);
    assert.equal(idTokenExpiresAt(idTokenWith({ sub: 'uid-1' })), null);
  });
});

describe('needsRenewal', () => {
  it('renews when there is no token', () => {
    assert.equal(needsRenewal(undefined, NOW), true);
  });

  it('keeps a token with time left', () => {
    assert.equal(
      needsRenewal(idTokenWith({ exp: NOW_SECONDS + 600 }), NOW),
      false
    );
  });

  it('renews a token about to expire', () => {
    assert.equal(
      needsRenewal(idTokenWith({ exp: NOW_SECONDS + 30 }), NOW),
      true
    );
  });

  it('renews an expired token', () => {
    assert.equal(
      needsRenewal(idTokenWith({ exp: NOW_SECONDS - 1 }), NOW),
      true
    );
  });
});

describe('sessionCookies', () => {
  it('keeps the ID token until it expires and the refresh token for a month', () => {
    const idToken = idTokenWith({ exp: NOW_SECONDS + 3600 });
    const [session, refresh] = sessionCookies(idToken, 'refresh-1', NOW);

    assert.equal(session.name, SESSION_COOKIE);
    assert.equal(session.value, idToken);
    assert.equal(session.options.maxAge, 3600);
    assert.equal(session.options.httpOnly, true);
    assert.equal(refresh.name, REFRESH_TOKEN_COOKIE);
    assert.equal(refresh.value, 'refresh-1');
    assert.equal(refresh.options.maxAge, 60 * 60 * 24 * 30);
    assert.equal(refresh.options.httpOnly, true);
  });

  it('expires a stored refresh token when none is given', () => {
    const [, refresh] = sessionCookies(
      idTokenWith({ exp: NOW_SECONDS + 3600 }),
      null,
      NOW
    );

    assert.equal(refresh.name, REFRESH_TOKEN_COOKIE);
    assert.equal(refresh.value, '');
    assert.equal(refresh.options.maxAge, 0);
  });
});

describe('clearedSessionCookies', () => {
  it('expires both cookies', () => {
    const cookies = clearedSessionCookies();

    assert.deepEqual(
      cookies.map(({ name, value, options }) => [name, value, options.maxAge]),
      [
        [SESSION_COOKIE, '', 0],
        [REFRESH_TOKEN_COOKIE, '', 0]
      ]
    );
  });
});

describe('renewIdToken', () => {
  it('exchanges the refresh token for a new ID token', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      Response.json({
        id_token: 'id-2',
        refresh_token: 'refresh-2',
        expires_in: '3600',
        user_id: 'uid-1'
      })
    );

    const renewal = await renewIdToken('refresh-1');

    const [url, init] = fetchMock.mock.calls[0].arguments as FetchArgs;
    const body = init?.body as URLSearchParams;

    assert.match(
      String(url),
      /^https:\/\/securetoken\.googleapis\.com\/v1\/token\?key=/
    );
    assert.equal(init?.method, 'POST');
    assert.equal(body.get('grant_type'), 'refresh_token');
    assert.equal(body.get('refresh_token'), 'refresh-1');
    assert.deepEqual(renewal, {
      status: 'renewed',
      idToken: 'id-2',
      refreshToken: 'refresh-2'
    });
  });

  it('reports a refresh token the service rejects as revoked', async (t) => {
    t.mock.method(globalThis, 'fetch', async () =>
      Response.json({ error: { message: 'TOKEN_EXPIRED' } }, { status: 400 })
    );

    assert.deepEqual(await renewIdToken('refresh-1'), { status: 'revoked' });
  });

  it('keeps the session when the request itself is rejected', async (t) => {
    t.mock.method(console, 'warn', () => {});
    t.mock.method(globalThis, 'fetch', async () =>
      Response.json(
        {
          error: {
            message: 'API key not valid. Please pass a valid API key.'
          }
        },
        { status: 400 }
      )
    );

    assert.deepEqual(await renewIdToken('refresh-1'), {
      status: 'unavailable'
    });
  });

  it('reports a service error as unavailable', async (t) => {
    t.mock.method(console, 'warn', () => {});
    t.mock.method(
      globalThis,
      'fetch',
      async () => new Response('', { status: 503 })
    );

    assert.deepEqual(await renewIdToken('refresh-1'), {
      status: 'unavailable'
    });
  });

  it('reports a network failure as unavailable', async (t) => {
    t.mock.method(console, 'warn', () => {});
    t.mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('fetch failed');
    });

    assert.deepEqual(await renewIdToken('refresh-1'), {
      status: 'unavailable'
    });
  });

  it('reports a response without tokens as unavailable', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => Response.json({}));

    assert.deepEqual(await renewIdToken('refresh-1'), {
      status: 'unavailable'
    });
  });
});

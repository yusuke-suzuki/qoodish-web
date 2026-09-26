import assert from 'node:assert/strict';
import { before, describe, it, mock } from 'node:test';
import {
  type AccessConfig,
  fetchAccessKeys,
  hasAccess,
  verifyAccessJwt
} from './access.ts';

const CONFIG: AccessConfig = {
  teamDomain: 'qoodish.cloudflareaccess.com',
  audience: 'admin-aud'
};

const NOW = Date.UTC(2026, 0, 1);
const NOW_SECONDS = NOW / 1000;

const ALGORITHM = {
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256'
} as const;

let signingKey: CryptoKey;
let publicJwk: JsonWebKey;
let otherSigningKey: CryptoKey;

function encode(value: object | Uint8Array): string {
  const bytes =
    value instanceof Uint8Array
      ? value
      : new TextEncoder().encode(JSON.stringify(value));

  return Buffer.from(bytes).toString('base64url');
}

async function sign(
  payload: object,
  { kid = 'key-1', alg = 'RS256', key = signingKey } = {}
): Promise<string> {
  const unsigned = `${encode({ alg, kid })}.${encode(payload)}`;
  const signature = await crypto.subtle.sign(
    ALGORITHM.name,
    key,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${encode(new Uint8Array(signature))}`;
}

function validPayload(overrides: object = {}): object {
  return {
    iss: `https://${CONFIG.teamDomain}`,
    aud: [CONFIG.audience],
    exp: NOW_SECONDS + 60,
    nbf: NOW_SECONDS - 60,
    ...overrides
  };
}

function keysFetcher() {
  return mock.fn(async () => [{ ...publicJwk, kid: 'key-1' }]);
}

before(async () => {
  const pair = await crypto.subtle.generateKey(ALGORITHM, true, [
    'sign',
    'verify'
  ]);
  signingKey = pair.privateKey;
  publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);

  const other = await crypto.subtle.generateKey(ALGORITHM, true, [
    'sign',
    'verify'
  ]);
  otherSigningKey = other.privateKey;
});

describe('verifyAccessJwt', () => {
  it('accepts a token signed by the team for the application', async () => {
    const token = await sign(validPayload());

    assert.equal(
      await verifyAccessJwt(token, CONFIG, keysFetcher(), NOW),
      true
    );
  });

  it('rejects a token signed by another key', async () => {
    const token = await sign(validPayload(), { key: otherSigningKey });

    assert.equal(
      await verifyAccessJwt(token, CONFIG, keysFetcher(), NOW),
      false
    );
  });

  it('rejects a token issued for another application', async () => {
    const token = await sign(validPayload({ aud: ['other-aud'] }));

    assert.equal(
      await verifyAccessJwt(token, CONFIG, keysFetcher(), NOW),
      false
    );
  });

  it('rejects a token issued by another team', async () => {
    const token = await sign(
      validPayload({ iss: 'https://other.cloudflareaccess.com' })
    );

    assert.equal(
      await verifyAccessJwt(token, CONFIG, keysFetcher(), NOW),
      false
    );
  });

  it('rejects an expired token', async () => {
    const token = await sign(validPayload({ exp: NOW_SECONDS - 1 }));

    assert.equal(
      await verifyAccessJwt(token, CONFIG, keysFetcher(), NOW),
      false
    );
  });

  it('rejects a token that is not valid yet', async () => {
    const token = await sign(validPayload({ nbf: NOW_SECONDS + 60 }));

    assert.equal(
      await verifyAccessJwt(token, CONFIG, keysFetcher(), NOW),
      false
    );
  });

  it('rejects an algorithm other than RS256', async () => {
    const token = await sign(validPayload(), { alg: 'none' });

    assert.equal(
      await verifyAccessJwt(token, CONFIG, keysFetcher(), NOW),
      false
    );
  });

  it('refetches the keys once when the key id is unknown', async () => {
    const token = await sign(validPayload(), { kid: 'rotated' });
    const fetchKeys = mock.fn(async (_teamDomain: string, refresh: boolean) =>
      refresh ? [{ ...publicJwk, kid: 'rotated' }] : []
    );

    assert.equal(await verifyAccessJwt(token, CONFIG, fetchKeys, NOW), true);
    assert.deepEqual(
      fetchKeys.mock.calls.map((call) => call.arguments[1]),
      [false, true]
    );
  });

  it('rejects a malformed token without fetching keys', async () => {
    const fetchKeys = keysFetcher();

    assert.equal(
      await verifyAccessJwt('not-a-jwt', CONFIG, fetchKeys, NOW),
      false
    );
    assert.equal(fetchKeys.mock.callCount(), 0);
  });
});

describe('fetchAccessKeys', () => {
  const MINUTE = 60 * 1000;

  it('refetches for an unknown key at most once per five minutes', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: 0 });
    const fetchMock = t.mock.method(
      globalThis,
      'fetch',
      async () => new Response(JSON.stringify({ keys: [{ kid: 'key-1' }] }))
    );
    const teamDomain = 'throttle.cloudflareaccess.com';

    await fetchAccessKeys(teamDomain, false);
    await fetchAccessKeys(teamDomain, true);
    await fetchAccessKeys(teamDomain, true);

    assert.equal(fetchMock.mock.callCount(), 1);
    assert.equal(
      fetchMock.mock.calls[0].arguments[0],
      'https://throttle.cloudflareaccess.com/cdn-cgi/access/certs'
    );

    t.mock.timers.tick(5 * MINUTE);
    await fetchAccessKeys(teamDomain, true);

    assert.equal(fetchMock.mock.callCount(), 2);
  });

  it('gives concurrent callers the keys of one shared fetch', async (t) => {
    let resolve: (value: Response) => void = () => {};
    const response = new Promise<Response>((settle) => {
      resolve = settle;
    });
    const fetchMock = t.mock.method(globalThis, 'fetch', () => response);
    const teamDomain = 'concurrent.cloudflareaccess.com';

    const first = fetchAccessKeys(teamDomain, false);
    const second = fetchAccessKeys(teamDomain, false);
    const refreshing = fetchAccessKeys(teamDomain, true);
    resolve(new Response(JSON.stringify({ keys: [{ kid: 'key-1' }] })));

    for (const keys of await Promise.all([first, second, refreshing])) {
      assert.deepEqual(keys, [{ kid: 'key-1' }]);
    }
    assert.equal(fetchMock.mock.callCount(), 1);
  });

  it('retries a failed fetch after thirty seconds', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: 0 });
    const fetchMock = t.mock.method(
      globalThis,
      'fetch',
      async () => new Response(null, { status: 503 })
    );
    const teamDomain = 'outage.cloudflareaccess.com';

    await assert.rejects(fetchAccessKeys(teamDomain, false));
    t.mock.timers.tick(29 * 1000);
    assert.deepEqual(await fetchAccessKeys(teamDomain, false), []);
    assert.equal(fetchMock.mock.callCount(), 1);

    t.mock.timers.tick(1000);
    await assert.rejects(fetchAccessKeys(teamDomain, false));

    assert.equal(fetchMock.mock.callCount(), 2);
  });

  it('keeps the cached keys when a refetch fails', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: 0 });
    const fetchMock = t.mock.method(
      globalThis,
      'fetch',
      async () => new Response(JSON.stringify({ keys: [{ kid: 'key-1' }] }))
    );
    const teamDomain = 'flaky.cloudflareaccess.com';

    await fetchAccessKeys(teamDomain, false);
    fetchMock.mock.mockImplementation(
      async () => new Response(null, { status: 503 })
    );
    t.mock.timers.tick(60 * MINUTE);

    assert.deepEqual(await fetchAccessKeys(teamDomain, false), [
      { kid: 'key-1' }
    ]);
    assert.equal(fetchMock.mock.callCount(), 2);
  });
});

describe('hasAccess', () => {
  it('refuses every token until the team domain and audience are set', async () => {
    assert.equal(await hasAccess('token', {}), false);
    assert.equal(
      await hasAccess('token', { teamDomain: CONFIG.teamDomain }),
      false
    );
  });

  it('refuses a request without an assertion', async () => {
    assert.equal(await hasAccess(undefined, CONFIG), false);
  });
});

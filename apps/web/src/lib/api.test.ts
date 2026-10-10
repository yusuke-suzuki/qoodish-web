import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import type { Maintenance } from './maintenance.ts';

type Api = typeof import('./api.ts');

const getMaintenance = mock.fn<() => Promise<Maintenance | null>>(
  async () => null
);

mock.module(new URL('./maintenance.ts', import.meta.url).href, {
  namedExports: { getMaintenance }
});

let apiFetch: Api['apiFetch'];
let apiFetchList: Api['apiFetchList'];
let apiFetchOrThrow: Api['apiFetchOrThrow'];
let apiFetchPage: Api['apiFetchPage'];
let assertApiAvailable: Api['assertApiAvailable'];
let performApiFetch: Api['performApiFetch'];

before(async () => {
  ({
    apiFetch,
    apiFetchList,
    apiFetchOrThrow,
    apiFetchPage,
    assertApiAvailable,
    performApiFetch
  } = await import('./api.ts'));
});

process.env.API_ENDPOINT = 'https://api.example.com';

beforeEach(() => {
  getMaintenance.mock.resetCalls();
  getMaintenance.mock.mockImplementation(async () => null);
});

function underMaintenance(): void {
  getMaintenance.mock.mockImplementation(async () => ({
    until: '2026-10-20T15:00:00+09:00'
  }));
}

type FetchArgs = [input: string | URL | Request, init?: RequestInit];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('performApiFetch', () => {
  it('sends an authenticated request with a bearer token', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({ id: 1 })
    );

    const result = await performApiFetch('/maps', {
      token: 'token-1',
      acceptLanguage: 'ja'
    });

    const [url, init] = fetchMock.mock.calls[0].arguments as FetchArgs;
    const requestHeaders = init?.headers as Headers;

    assert.equal(url, 'https://api.example.com/maps');
    assert.equal(requestHeaders.get('Authorization'), 'Bearer token-1');
    assert.equal(requestHeaders.get('Accept-Language'), 'ja');
    assert.deepEqual(result, { data: { id: 1 }, error: null, status: 200 });
  });

  it('falls back to the guest API without a token', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse([])
    );

    await performApiFetch('/maps', { token: null, acceptLanguage: 'en' });

    const [url, init] = fetchMock.mock.calls[0].arguments as FetchArgs;
    const requestHeaders = init?.headers as Headers;

    assert.equal(url, 'https://api.example.com/guest/maps');
    assert.equal(requestHeaders.has('Authorization'), false);
  });

  it('passes caller headers through alongside the defaults', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({})
    );

    await performApiFetch('/maps', {
      token: 'token-1',
      acceptLanguage: 'en',
      headers: { 'X-Requested-With': 'test' }
    });

    const [, init] = fetchMock.mock.calls[0].arguments as FetchArgs;
    const requestHeaders = init?.headers as Headers;

    assert.equal(requestHeaders.get('X-Requested-With'), 'test');
    assert.equal(requestHeaders.get('Accept'), 'application/json');
  });

  it('lets a caller header replace the default of any casing', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({})
    );

    await performApiFetch('/maps', {
      token: 'token-1',
      acceptLanguage: 'en',
      headers: { 'content-type': 'multipart/form-data' }
    });

    const [, init] = fetchMock.mock.calls[0].arguments as FetchArgs;
    const requestHeaders = init?.headers as Headers;

    assert.equal(requestHeaders.get('Content-Type'), 'multipart/form-data');
  });

  it('surfaces the backend error detail', async (t) => {
    t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({ detail: 'Name is required' }, 422)
    );

    const result = await performApiFetch('/maps', {
      token: 'token-1',
      acceptLanguage: 'en'
    });

    assert.deepEqual(result, {
      data: null,
      error: 'Name is required',
      status: 422
    });
  });

  it('falls back to a status message for a non-JSON error body', async (t) => {
    t.mock.method(
      globalThis,
      'fetch',
      async () => new Response('oops', { status: 500 })
    );

    const result = await performApiFetch('/maps', {
      token: 'token-1',
      acceptLanguage: 'en'
    });

    assert.deepEqual(result, {
      data: null,
      error: 'An error occurred.',
      status: 500
    });
  });

  it('words a transport failure in the reader’s language', async (t) => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('fetch failed');
    });

    const result = await performApiFetch('/maps', {
      token: null,
      acceptLanguage: 'ja-JP'
    });

    assert.equal(
      result.error,
      'サーバーに接続できませんでした。時間をおいて再度お試しください。'
    );
  });

  it('treats 204 as success without a body', async (t) => {
    t.mock.method(
      globalThis,
      'fetch',
      async () => new Response(null, { status: 204 })
    );

    const result = await performApiFetch('/maps/1', {
      token: 'token-1',
      acceptLanguage: 'en',
      method: 'DELETE'
    });

    assert.deepEqual(result, { data: null, error: null, status: 204 });
  });

  it('reports a timeout distinctly from other failures', async (t) => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async () => {
      throw new DOMException('The operation timed out', 'TimeoutError');
    });

    const result = await performApiFetch('/maps', {
      token: null,
      acceptLanguage: 'en'
    });

    assert.deepEqual(result, {
      data: null,
      error: 'The request timed out. Please try again later.',
      status: 0
    });
  });

  it('reports unreachable backends as a network error', async (t) => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('fetch failed');
    });

    const result = await performApiFetch('/maps', {
      token: null,
      acceptLanguage: 'en'
    });

    assert.deepEqual(result, {
      data: null,
      error: 'Could not reach the server. Please try again later.',
      status: 0
    });
  });

  it('refuses a write during maintenance without reaching the API', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({})
    );
    underMaintenance();

    const result = await performApiFetch('/maps', {
      token: 'token-1',
      acceptLanguage: 'ja',
      method: 'post',
      body: '{}'
    });

    assert.equal(fetchMock.mock.callCount(), 0);
    assert.deepEqual(result, {
      data: null,
      error: 'メンテナンス中のため、しばらくしてからやり直してください。',
      status: 503
    });
  });

  it('refuses a delete during maintenance', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({})
    );
    underMaintenance();

    const result = await performApiFetch('/maps/1', {
      token: 'token-1',
      acceptLanguage: 'en',
      method: 'DELETE'
    });

    assert.equal(fetchMock.mock.callCount(), 0);
    assert.equal(
      result.error,
      'Qoodish is under maintenance. Please try again later.'
    );
  });

  it('still reads during maintenance', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({ id: 1 })
    );
    underMaintenance();

    const result = await performApiFetch('/maps', {
      token: null,
      acceptLanguage: 'en'
    });

    assert.equal(fetchMock.mock.callCount(), 1);
    assert.deepEqual(result, { data: { id: 1 }, error: null, status: 200 });
  });

  it('does not consult the flag for a read', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({}));

    await performApiFetch('/maps', {
      token: null,
      acceptLanguage: 'en',
      method: 'HEAD'
    });

    assert.equal(getMaintenance.mock.callCount(), 0);
  });

  it('prefers a caller-provided abort signal', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({})
    );

    const controller = new AbortController();

    await performApiFetch('/maps', {
      token: null,
      acceptLanguage: 'en',
      signal: controller.signal
    });

    const [, init] = fetchMock.mock.calls[0].arguments as FetchArgs;

    assert.equal(init?.signal, controller.signal);
  });
});

// The guest + explicit-lang path is the only one that needs no Next.js
// request scope, which makes it the seam where apiFetch itself is testable.
describe('apiFetch', () => {
  it('resolves a guest request with an explicit language', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse([])
    );

    const result = await apiFetch('/maps', { guest: true, lang: 'ja' });

    const [url, init] = fetchMock.mock.calls[0].arguments as FetchArgs;
    const requestHeaders = init?.headers as Headers;

    assert.equal(url, 'https://api.example.com/guest/maps');
    assert.equal(requestHeaders.get('Accept-Language'), 'ja');
    assert.deepEqual(result, { data: [], error: null, status: 200 });
  });
});

describe('apiFetchOrThrow', () => {
  it('returns the payload on success', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse({ id: 7 }));

    assert.deepEqual(
      await apiFetchOrThrow('/maps/7', { guest: true, lang: 'en' }),
      { id: 7 }
    );
  });

  it('throws the backend error detail', async (t) => {
    t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({ detail: 'Not found' }, 404)
    );

    await assert.rejects(
      apiFetchOrThrow('/maps/7', { guest: true, lang: 'en' }),
      /Not found/
    );
  });
});

describe('apiFetchList', () => {
  it('returns the list the API gave', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => jsonResponse([{ id: 1 }]));

    assert.deepEqual(await apiFetchList('/maps', { guest: true, lang: 'en' }), [
      { id: 1 }
    ]);
  });

  it('reads a 4xx as an empty list', async (t) => {
    t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({ detail: 'Unauthorized' }, 401)
    );

    assert.deepEqual(
      await apiFetchList('/maps', { guest: true, lang: 'en' }),
      []
    );
  });

  it('throws when the API is down instead of answering empty', async (t) => {
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('fetch failed');
    });

    await assert.rejects(apiFetchList('/maps', { guest: true, lang: 'en' }));
  });

  it('throws on a server error', async (t) => {
    t.mock.method(
      globalThis,
      'fetch',
      async () => new Response('oops', { status: 502 })
    );

    await assert.rejects(apiFetchList('/maps', { guest: true, lang: 'en' }));
  });
});

describe('apiFetchPage', () => {
  it('reads the page and the cursor that continues it', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({ data: [{ id: 1 }], next_cursor: 'abc' })
    );

    assert.deepEqual(
      await apiFetchPage('/v2/pins', { guest: true, lang: 'en' }),
      { items: [{ id: 1 }], nextCursor: 'abc' }
    );

    const [url] = fetchMock.mock.calls[0].arguments as FetchArgs;

    assert.equal(url, 'https://api.example.com/guest/v2/pins');
  });

  it('asks for the page after the cursor it was given', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({ data: [], next_cursor: null })
    );

    await apiFetchPage('/v2/pins', {
      guest: true,
      lang: 'en',
      cursor: 'a+b/c='
    });

    const [url] = fetchMock.mock.calls[0].arguments as FetchArgs;

    assert.equal(
      url,
      'https://api.example.com/guest/v2/pins?cursor=a%2Bb%2Fc%3D'
    );
  });

  it('sends the cursor alongside the query it was given', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({ data: [], next_cursor: null })
    );

    await apiFetchPage('/v2/me/notifications', {
      guest: true,
      lang: 'en',
      query: { read: 'false' },
      cursor: 'c1'
    });

    const [url] = fetchMock.mock.calls[0].arguments as FetchArgs;

    assert.equal(
      url,
      'https://api.example.com/guest/v2/me/notifications?read=false&cursor=c1'
    );
  });

  it('reads a 4xx as an empty last page', async (t) => {
    t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse({ detail: 'Unauthorized' }, 401)
    );

    assert.deepEqual(
      await apiFetchPage('/v2/pins', { guest: true, lang: 'en' }),
      { items: [], nextCursor: null }
    );
  });

  it('throws on a server error', async (t) => {
    t.mock.method(
      globalThis,
      'fetch',
      async () => new Response('oops', { status: 502 })
    );

    await assert.rejects(apiFetchPage('/v2/pins', { guest: true, lang: 'en' }));
  });
});

describe('assertApiAvailable', () => {
  it('accepts responses the caller can interpret', () => {
    assert.doesNotThrow(() => assertApiAvailable(200, '/maps/1'));
    assert.doesNotThrow(() => assertApiAvailable(404, '/maps/1'));
  });

  it('rejects unreachable and failing backends', () => {
    assert.throws(() => assertApiAvailable(0, '/maps/1'));
    assert.throws(() => assertApiAvailable(500, '/maps/1'));
    assert.throws(() => assertApiAvailable(503, '/maps/1'));
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  apiFetch,
  apiFetchOrThrow,
  assertApiAvailable,
  performApiFetch
} from './api';

process.env.API_ENDPOINT = 'https://api.example.com';

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
    const requestHeaders = init?.headers as Record<string, string>;

    assert.equal(url, 'https://api.example.com/maps');
    assert.equal(requestHeaders.Authorization, 'Bearer token-1');
    assert.equal(requestHeaders['Accept-Language'], 'ja');
    assert.deepEqual(result, { data: { id: 1 }, error: null, status: 200 });
  });

  it('falls back to the guest API without a token', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      jsonResponse([])
    );

    await performApiFetch('/maps', { token: null, acceptLanguage: 'en' });

    const [url, init] = fetchMock.mock.calls[0].arguments as FetchArgs;
    const requestHeaders = init?.headers as Record<string, string>;

    assert.equal(url, 'https://api.example.com/guest/maps');
    assert.equal('Authorization' in requestHeaders, false);
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
    const requestHeaders = init?.headers as Record<string, string>;

    assert.equal(requestHeaders['x-requested-with'], 'test');
    assert.equal(requestHeaders.Accept, 'application/json');
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
      error: 'Request failed with status 500',
      status: 500
    });
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
      error: 'Request timed out',
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

    assert.deepEqual(result, { data: null, error: 'Network error', status: 0 });
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
    const requestHeaders = init?.headers as Record<string, string>;

    assert.equal(url, 'https://api.example.com/guest/maps');
    assert.equal(requestHeaders['Accept-Language'], 'ja');
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

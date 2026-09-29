import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { searchMaps } from './mapSearch.ts';

type FetchArgs = [input: string | URL | Request, init?: RequestInit];

describe('searchMaps', () => {
  it('queries the guest map search with the encoded input', async (t) => {
    const maps = [{ id: 2, name: 'Coffee & tea' }];
    const fetchMock = t.mock.method(
      globalThis,
      'fetch',
      async () => new Response(JSON.stringify(maps))
    );
    const controller = new AbortController();

    const result = await searchMaps('coffee & tea', controller.signal);

    const [url, init] = fetchMock.mock.calls[0].arguments as FetchArgs;

    assert.equal(url, '/api/v1/guest/maps?input=coffee%20%26%20tea');
    assert.equal(init?.signal, controller.signal);
    assert.deepEqual(result, maps);
  });

  it('rejects on an error status so the search reports a failure', async (t) => {
    t.mock.method(
      globalThis,
      'fetch',
      async () => new Response('oops', { status: 503 })
    );

    await assert.rejects(
      searchMaps('coffee', new AbortController().signal),
      /status 503/
    );
  });
});

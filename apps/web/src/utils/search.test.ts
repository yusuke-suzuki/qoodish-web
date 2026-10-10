import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type {
  GuestChapter,
  GuestMap,
  GuestPin,
  UserSummary
} from '../../types/index.ts';
import {
  hasSearchableTerm,
  searchChapters,
  searchMaps,
  searchPins,
  searchUsers,
  toSearchResults
} from './search.ts';

describe('hasSearchableTerm', () => {
  it('accepts input with a term of two or more characters', () => {
    assert.equal(hasSearchableTerm('京都'), true);
    assert.equal(hasSearchableTerm('京 京都'), true);
  });

  it('rejects input made only of single characters', () => {
    assert.equal(hasSearchableTerm(''), false);
    assert.equal(hasSearchableTerm('京 a'), false);
    assert.equal(hasSearchableTerm('"a"'), false);
  });

  it('counts a character outside the BMP as one character', () => {
    assert.equal(hasSearchableTerm('𠮷'), false);
  });
});

type FetchArgs = [input: string | URL | Request, init?: RequestInit];

describe('search requests', () => {
  for (const [search, url] of [
    [searchMaps, '/api/v1/guest/maps?input=coffee%20%26%20tea'],
    [searchChapters, '/api/v1/guest/chapters?input=coffee%20%26%20tea'],
    [searchPins, '/api/v1/guest/pins?input=coffee%20%26%20tea'],
    [searchUsers, '/api/v1/users?q=coffee%20%26%20tea']
  ] as const) {
    it(`${search.name} queries ${url.split('?')[0]} with the encoded input`, async (t) => {
      const hits = [{ id: 2, name: 'Coffee & tea' }];
      const fetchMock = t.mock.method(
        globalThis,
        'fetch',
        async () => new Response(JSON.stringify(hits))
      );
      const controller = new AbortController();

      const result = await search('coffee & tea', controller.signal);

      const [requested, init] = fetchMock.mock.calls[0].arguments as FetchArgs;

      assert.equal(requested, url);
      assert.equal(init?.signal, controller.signal);
      assert.deepEqual(result, hits);
    });
  }

  it('rejects on an error status so the search reports a failure', async (t) => {
    t.mock.method(
      globalThis,
      'fetch',
      async () => new Response('oops', { status: 503 })
    );

    await assert.rejects(
      searchPins('coffee', new AbortController().signal),
      /status 503/
    );
  });
});

describe('toSearchResults', () => {
  const localePath = (path: string) => `/ja${path}`;
  const shoyu = {
    id: 2,
    name: 'Shoyu',
    images: [{ id: 9, avatar: 'pin.png' }],
    map: { id: 1, name: 'Ramen' }
  } as GuestPin;

  it('lists maps, then chapters, then pins, then users with links to each', () => {
    const results = toSearchResults(
      {
        maps: [
          { id: 1, name: 'Ramen', image: { avatar: 'map.png' } } as GuestMap
        ],
        chapters: [
          {
            id: 4,
            title: 'Alley walk',
            image: { avatar: 'chapter.png' },
            map: { id: 1, name: 'Ramen' }
          } as GuestChapter
        ],
        pins: [shoyu],
        users: [{ id: 3, name: 'okayu', image: null } as UserSummary]
      },
      localePath
    );

    assert.deepEqual(results, [
      {
        type: 'map',
        id: 1,
        name: 'Ramen',
        detail: null,
        avatar: 'map.png',
        href: '/ja/maps/1'
      },
      {
        type: 'chapter',
        id: 4,
        name: 'Alley walk',
        detail: 'Ramen',
        avatar: 'chapter.png',
        href: '/ja/chapters/4'
      },
      {
        type: 'pin',
        id: 2,
        name: 'Shoyu',
        detail: 'Ramen',
        avatar: 'pin.png',
        href: '/ja/pins/2'
      },
      {
        type: 'user',
        id: 3,
        name: 'okayu',
        detail: null,
        avatar: undefined,
        href: '/ja/users/3'
      }
    ]);
  });

  it('leaves the avatar empty for a pin without images', () => {
    const [result] = toSearchResults(
      {
        maps: [],
        chapters: [],
        pins: [{ ...shoyu, images: [] }],
        users: []
      },
      localePath
    );

    assert.equal(result.avatar, undefined);
  });
});

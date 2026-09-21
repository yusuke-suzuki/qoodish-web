import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AppMap, Author, Chapter, Pin } from '../../types/index.ts';
import {
  chapterStructuredData,
  mapStructuredData,
  pinStructuredData,
  siteStructuredData
} from './structuredData.ts';

const author = {
  id: 7,
  name: 'Kei',
  biography: '',
  image: null
} satisfies Author;

const appMap = {
  id: 5,
  author,
  name: 'Kyoto',
  description: 'Places worth the walk',
  private: false,
  latitude: 35,
  longitude: 135,
  bookmarking: false,
  bookmarkable: true,
  editable: false,
  image: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-02-01T00:00:00Z'
} satisfies AppMap;

const pin = {
  id: 12,
  author,
  name: 'Kinkaku-ji',
  comment: 'Gold on a still pond.',
  comments: [],
  images: [],
  latitude: 35.03,
  longitude: 135.72,
  map: appMap,
  editable: false,
  liked: false,
  likes_count: 3,
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-02T00:00:00Z'
} satisfies Pin;

const chapter = {
  id: 9,
  map_id: 5,
  journey_id: null,
  title: 'A morning in Kyoto',
  status: 'published',
  content: {} as Chapter['content'],
  map_features: { type: 'FeatureCollection', features: [] },
  image: null,
  editable: false,
  author,
  map: { id: 5, name: 'Kyoto', private: false },
  journal: null,
  liked: false,
  likes_count: 1,
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-02T00:00:00Z'
} satisfies Chapter;

describe('siteStructuredData', () => {
  it('states the organization and the site under stable ids', () => {
    const graph = siteStructuredData('ja', 'Headline', 'Description')[
      '@graph'
    ] as Record<string, unknown>[];

    assert.deepEqual(
      graph.map((node) => node['@type']),
      ['Organization', 'WebSite']
    );
    assert.equal(graph[0]['@id'], 'https://qoodish.com/#organization');
    assert.deepEqual(graph[1].publisher, {
      '@id': 'https://qoodish.com/#organization'
    });
    assert.equal(graph[1].inLanguage, 'ja');
  });
});

describe('pinStructuredData', () => {
  it('describes the pin as an article about a place', () => {
    const data = pinStructuredData(pin, 'en');

    assert.ok(data);
    assert.equal(data['@type'], 'Article');
    assert.equal(data.headline, 'Kinkaku-ji');
    assert.equal(data.url, 'https://qoodish.com/en/pins/12');
    assert.deepEqual(data.about, {
      '@type': 'Place',
      name: 'Kinkaku-ji',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 35.03,
        longitude: 135.72
      }
    });
  });

  it('attributes the pin without exposing the author picture', () => {
    assert.deepEqual(pinStructuredData(pin, 'en')?.author, {
      '@type': 'Person',
      name: 'Kei',
      url: 'https://qoodish.com/en/users/7'
    });
  });

  it('leaves out an empty comment rather than stating it', () => {
    const data = pinStructuredData({ ...pin, comment: '' }, 'en');

    assert.ok(data);
    assert.equal('description' in data, false);
  });

  it('leaves out the image when the pin has no photograph', () => {
    const data = pinStructuredData(pin, 'en');

    assert.ok(data);
    assert.equal('image' in data, false);
  });

  it('says nothing about a pin on a private map', () => {
    const privateMap = { ...appMap, private: true };

    assert.equal(pinStructuredData({ ...pin, map: privateMap }, 'en'), null);
  });

  it('points at the map it belongs to by the id the map page emits', () => {
    const isPartOf = pinStructuredData(pin, 'en')?.isPartOf as Record<
      string,
      unknown
    >;

    assert.equal(isPartOf['@id'], mapStructuredData(appMap, [], 'en')?.['@id']);
  });
});

describe('mapStructuredData', () => {
  it('says nothing about a private map', () => {
    assert.equal(
      mapStructuredData({ ...appMap, private: true }, [], 'en'),
      null
    );
  });

  it('lists the pins it collects', () => {
    const list = mapStructuredData(appMap, [pin], 'ja')?.mainEntity as Record<
      string,
      unknown
    >;

    assert.equal(list.numberOfItems, 1);
    assert.deepEqual(list.itemListElement, [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Kinkaku-ji',
        url: 'https://qoodish.com/ja/pins/12'
      }
    ]);
  });

  it('leaves out the list rather than stating an empty one', () => {
    const data = mapStructuredData(appMap, [], 'en');

    assert.ok(data);
    assert.equal('mainEntity' in data, false);
  });

  it('caps the list so a large map does not carry every pin twice', () => {
    const pins = Array.from({ length: 150 }, (_, index) => ({
      ...pin,
      id: index + 1
    }));
    const list = mapStructuredData(appMap, pins, 'en')?.mainEntity as Record<
      string,
      unknown
    >;

    assert.equal(list.numberOfItems, 100);
  });
});

describe('chapterStructuredData', () => {
  it('describes a chapter as an article with its dates', () => {
    const data = chapterStructuredData(chapter, 'en');

    assert.ok(data);
    assert.equal(data['@type'], 'Article');
    assert.equal(data.headline, 'A morning in Kyoto');
    assert.equal(data.datePublished, '2026-04-01T00:00:00Z');
    assert.equal(data.dateModified, '2026-04-02T00:00:00Z');
  });

  it('omits a private map rather than naming it', () => {
    const data = chapterStructuredData(
      { ...chapter, map: { id: 5, name: 'Kyoto', private: true } },
      'en'
    );

    assert.ok(data);
    assert.equal('isPartOf' in data, false);
  });

  it('says nothing about a draft', () => {
    assert.equal(
      chapterStructuredData({ ...chapter, status: 'draft' }, 'en'),
      null
    );
  });

  it('says nothing about an untitled chapter, which has no headline', () => {
    assert.equal(chapterStructuredData({ ...chapter, title: '' }, 'en'), null);
  });
});

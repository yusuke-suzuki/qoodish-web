import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AppMap, Chapter, Profile, Review } from '../../types/index.ts';
import {
  chapterJsonLd,
  mapJsonLd,
  profileJsonLd,
  reviewJsonLd,
  serializeJsonLd
} from './structuredData.ts';

const author = { id: 3, name: 'Ann', biography: '', image: null };

const map = {
  id: 5,
  name: 'Kyoto',
  description: 'Temples',
  private: false,
  author,
  image: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z'
} as unknown as AppMap;

const review = {
  id: 9,
  name: 'Kinkaku-ji',
  comment: 'Golden.',
  author,
  images: [{ url: 'https://images.example.com/1/public' }],
  latitude: 35.03,
  longitude: 135.72,
  map,
  created_at: '2026-01-03T00:00:00Z',
  updated_at: '2026-01-04T00:00:00Z'
} as unknown as Review;

describe('reviewJsonLd', () => {
  it('describes the report, its author and the place', () => {
    const data = reviewJsonLd('ja', review);

    assert.equal(data['@type'], 'Review');
    assert.equal(data.url, 'https://qoodish.com/ja/maps/5/reports/9');
    assert.deepEqual(data.author, {
      '@type': 'Person',
      name: 'Ann',
      url: 'https://qoodish.com/ja/users/3'
    });
    assert.deepEqual(data.image, ['https://images.example.com/1/public']);
    assert.deepEqual(data.itemReviewed, {
      '@type': 'Place',
      name: 'Kinkaku-ji',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 35.03,
        longitude: 135.72
      }
    });
  });
});

describe('mapJsonLd', () => {
  it('lists the reports the map collects', () => {
    const data = mapJsonLd('en', map, [review]);

    assert.equal(data['@type'], 'CollectionPage');
    assert.deepEqual(data.mainEntity, {
      '@type': 'ItemList',
      numberOfItems: 1,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Kinkaku-ji',
          url: 'https://qoodish.com/en/maps/5/reports/9'
        }
      ]
    });
  });
});

describe('chapterJsonLd', () => {
  it('describes the chapter as an article about its map', () => {
    const chapter = {
      id: 2,
      title: '',
      author,
      image: null,
      map: { id: 5, name: 'Kyoto', private: false },
      created_at: '2026-01-05T00:00:00Z',
      updated_at: '2026-01-06T00:00:00Z'
    } as unknown as Chapter;

    const data = chapterJsonLd('en', chapter, 'Untitled');

    assert.equal(data['@type'], 'Article');
    assert.equal(data.headline, 'Untitled');
    assert.deepEqual(data.about, {
      '@type': 'CreativeWork',
      name: 'Kyoto',
      url: 'https://qoodish.com/en/maps/5'
    });
  });
});

describe('profileJsonLd', () => {
  it('leaves private maps and drafts out of the person’s pages', () => {
    const profile = { ...author, biography: 'Hi' } as unknown as Profile;
    const privateMap = { ...map, id: 6, private: true };
    const draft = { id: 7, title: 'Draft', status: 'draft' } as Chapter;
    const published = {
      id: 8,
      title: 'Done',
      status: 'published'
    } as Chapter;

    const data = profileJsonLd(
      'en',
      profile,
      [map, privateMap],
      [draft, published]
    );

    assert.deepEqual(data.hasPart, [
      {
        '@type': 'CreativeWork',
        name: 'Kyoto',
        url: 'https://qoodish.com/en/maps/5'
      },
      {
        '@type': 'Article',
        headline: 'Done',
        url: 'https://qoodish.com/en/chapters/8'
      }
    ]);
  });
});

describe('serializeJsonLd', () => {
  it('escapes a closing tag hidden in a value', () => {
    const output = serializeJsonLd({
      '@type': 'Thing',
      name: '</script><script>alert(1)</script>'
    });

    assert.ok(!output.includes('</script>'));
    assert.deepEqual(JSON.parse(output), {
      '@type': 'Thing',
      name: '</script><script>alert(1)</script>'
    });
  });
});

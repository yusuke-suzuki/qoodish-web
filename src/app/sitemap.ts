import type { MetadataRoute } from 'next';
import { getChapterFeed } from '../lib/chapters.ts';
import { getActiveMaps, getPopularMaps, getRecentMaps } from '../lib/maps.ts';
import { getPinFeed, getPopularPins } from '../lib/pins.ts';
import { DEFAULT_LOCALE, LOCALES, localePath } from '../utils/locales.ts';
import { SITE_ORIGIN } from '../utils/metadata.ts';
import pageAll from '../utils/pageAll.ts';

export const revalidate = 3600;

type Entry = {
  path: string;
  lastModified?: string;
  priority: number;
};

const STATIC_ENTRIES: Entry[] = [
  { path: '/', priority: 1 },
  { path: '/discover', priority: 0.8 },
  { path: '/pins', priority: 0.7 },
  { path: '/chapters', priority: 0.7 },
  { path: '/terms', priority: 0.3 },
  { path: '/privacy', priority: 0.3 }
];

function absoluteUrl(locale: string, path: string): string {
  return `${SITE_ORIGIN}${localePath(locale, path)}`;
}

// One entry per locale, each carrying the full hreflang set: without them Google
// has no way to tell the localized variants apart from duplicates of each other.
function expand({
  path,
  lastModified,
  priority
}: Entry): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: absoluteUrl(locale, path),
    lastModified,
    priority,
    alternates: {
      languages: {
        en: absoluteUrl('en', path),
        ja: absoluteUrl('ja', path),
        'x-default': absoluteUrl(DEFAULT_LOCALE, path)
      }
    }
  }));
}

// The build prerenders this route with no API to ask, so there a failed
// list is an empty one. At revalidation the failure is rethrown instead:
// ISR then keeps serving the last good sitemap rather than a truncated one.
async function listOrEmpty<T>(list: Promise<T[]>): Promise<T[]> {
  try {
    return await list;
  } catch (error) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return [];
    }

    throw error;
  }
}

// The route waits on every page in turn, so what is worth capping is the round
// trips it spends, not the URLs they yield. Each source is walked this far and
// no further; what that covers is the budget times whatever the feed serves per
// page, which the API decides and may change. A site with more content than
// this reaches needs a sitemap index and a cheaper way to enumerate it, not a
// larger number here.
const PAGING = { maxRequests: 25 };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [activeMaps, popularMaps, recentMaps, popularPins, pins, chapters] =
    await Promise.all([
      listOrEmpty(getActiveMaps(DEFAULT_LOCALE)),
      listOrEmpty(getPopularMaps(DEFAULT_LOCALE)),
      listOrEmpty(getRecentMaps(DEFAULT_LOCALE)),
      listOrEmpty(getPopularPins(DEFAULT_LOCALE)),
      listOrEmpty(
        pageAll(
          (cursor) =>
            getPinFeed(DEFAULT_LOCALE, cursor?.created_at, cursor?.id),
          PAGING
        )
      ),
      listOrEmpty(
        pageAll(
          (cursor) =>
            getChapterFeed(DEFAULT_LOCALE, cursor?.created_at, cursor?.id),
          PAGING
        )
      )
    ]);

  const mapEntries = new Map<number, Entry>();

  for (const map of [...activeMaps, ...popularMaps, ...recentMaps]) {
    if (map.private) {
      continue;
    }

    mapEntries.set(map.id, {
      path: `/maps/${map.id}`,
      lastModified: map.updated_at,
      priority: 0.7
    });
  }

  const pinEntries = new Map<number, Entry>();

  for (const pin of [...popularPins, ...pins]) {
    if (pin.map.private) {
      continue;
    }

    pinEntries.set(pin.id, {
      path: `/pins/${pin.id}`,
      lastModified: pin.updated_at,
      priority: 0.6
    });
  }

  const chapterEntries = new Map<number, Entry>();

  for (const chapter of chapters) {
    if (chapter.status !== 'published') {
      continue;
    }

    chapterEntries.set(chapter.id, {
      path: `/chapters/${chapter.id}`,
      lastModified: chapter.updated_at,
      priority: 0.6
    });
  }

  return [
    ...STATIC_ENTRIES,
    ...Array.from(mapEntries.values()),
    ...Array.from(pinEntries.values()),
    ...Array.from(chapterEntries.values())
  ].flatMap(expand);
}

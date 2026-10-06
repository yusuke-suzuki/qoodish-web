import type { AppMap, Author, Chapter, Pin } from '../../types/index.ts';
import { localePath } from './locales.ts';
import { SITE_ORIGIN } from './metadata.ts';
import { imageUrl } from './photos.ts';

const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

// The mark drawn from the live theme, so the logo a search result shows is the
// amber the app is built in. The public variant serves it at the 512 square it
// was uploaded as; ogp would reshape it to 1200x630 and stop it being a square.
const ORGANIZATION_LOGO = imageUrl(
  '5afc3ed9-4adb-48fd-ee3a-ae83ce267900',
  'public'
);

// A map can hold far more pins than a search engine will read, and every
// entry is repeated in the page it is already rendered in.
const MAX_LIST_ITEMS = 100;

export type StructuredData = Record<string, unknown>;

function absoluteUrl(lang: string, path = ''): string {
  return `${SITE_ORIGIN}${localePath(lang, path)}`;
}

// A type filled with nulls and empty strings reads to a validator as a
// malformed one, so an absent value is left out rather than stated.
function present(data: StructuredData): StructuredData {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== undefined && value !== null && value !== '';
    })
  );
}

// Only the name and the page, never the picture: profiles are not indexed,
// and the name is already the byline the page renders.
function person(author: Author, lang: string): StructuredData {
  return {
    '@type': 'Person',
    name: author.name,
    url: absoluteUrl(lang, `/users/${author.id}`)
  };
}

function likeCounter(count: number): StructuredData {
  return {
    '@type': 'InteractionCounter',
    interactionType: 'https://schema.org/LikeAction',
    userInteractionCount: count
  };
}

function mapCollectionId(mapId: number, lang: string): string {
  return `${absoluteUrl(lang, `/maps/${mapId}`)}#collection`;
}

export function siteStructuredData(
  lang: string,
  headline: string,
  description: string
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'Qoodish',
        url: SITE_ORIGIN,
        logo: ORGANIZATION_LOGO
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: 'Qoodish',
        alternateName: headline,
        description,
        url: SITE_ORIGIN,
        inLanguage: lang,
        publisher: { '@id': ORGANIZATION_ID }
      }
    ]
  };
}

// A pin carries no rating, so the review vocabulary cannot be filled and is
// not used: an article about a place is what the page actually is.
export function pinStructuredData(
  pin: Pin,
  lang: string
): StructuredData | null {
  if (pin.map.private) {
    return null;
  }

  const url = absoluteUrl(lang, `/pins/${pin.id}`);

  return present({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: pin.name,
    description: pin.comment,
    image: pin.images.map((image) => image.ogp),
    datePublished: pin.created_at,
    dateModified: pin.updated_at,
    inLanguage: lang,
    author: person(pin.author, lang),
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: {
      '@type': 'CollectionPage',
      '@id': mapCollectionId(pin.map.id, lang),
      name: pin.map.name,
      url: absoluteUrl(lang, `/maps/${pin.map.id}`)
    },
    about: {
      '@type': 'Place',
      name: pin.name,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: pin.latitude,
        longitude: pin.longitude
      }
    },
    interactionStatistic: likeCounter(pin.likes_count)
  });
}

export function mapStructuredData(
  map: AppMap,
  pins: Pin[],
  lang: string
): StructuredData | null {
  if (map.private) {
    return null;
  }

  const url = absoluteUrl(lang, `/maps/${map.id}`);
  const listed = pins.slice(0, MAX_LIST_ITEMS);

  return present({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': mapCollectionId(map.id, lang),
    url,
    name: map.name,
    description: map.description,
    image: map.image?.ogp,
    inLanguage: lang,
    dateCreated: map.created_at,
    dateModified: map.updated_at,
    author: person(map.author, lang),
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity:
      listed.length > 0
        ? {
            '@type': 'ItemList',
            numberOfItems: listed.length,
            itemListElement: listed.map((pin, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: pin.name,
              url: absoluteUrl(lang, `/pins/${pin.id}`)
            }))
          }
        : undefined
  });
}

// An untitled chapter would leave the headline blank, and an article without
// one is the half-filled type that earns nothing.
export function chapterStructuredData(
  chapter: Chapter,
  lang: string
): StructuredData | null {
  if (chapter.status !== 'published' || !chapter.title) {
    return null;
  }

  const url = absoluteUrl(lang, `/chapters/${chapter.id}`);

  return present({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: chapter.title,
    image: chapter.image?.ogp,
    datePublished: chapter.created_at,
    dateModified: chapter.updated_at,
    inLanguage: lang,
    author: person(chapter.author, lang),
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf:
      chapter.map && !chapter.map.private
        ? {
            '@type': 'CollectionPage',
            '@id': mapCollectionId(chapter.map.id, lang),
            name: chapter.map.name,
            url: absoluteUrl(lang, `/maps/${chapter.map.id}`)
          }
        : undefined,
    interactionStatistic: likeCounter(chapter.likes_count)
  });
}

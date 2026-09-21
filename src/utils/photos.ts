const HOST = 'https://imagedelivery.net/ij3ygWRDWuATHKgheHKS5A';

// The host's named variants, the same three the API hands back for an upload.
const WIDTHS = { card: 400, hero: 800, full: 2048 };

export type Photo = {
  src: string;
  srcSet: string;
  ogp: string;
};

export function imageUrl(id: string, variant: string): string {
  return `${HOST}/${id}/${variant}`;
}

function photo(id: string): Photo {
  const url = (variant: string) => imageUrl(id, variant);

  return {
    // The middle size for anything that cannot read a set: the full variant is
    // 500KB.
    src: url('hero'),
    srcSet: `${url('card')} ${WIDTHS.card}w, ${url('hero')} ${WIDTHS.hero}w, ${url('public')} ${WIDTHS.full}w`,
    // Already cut to 1200x630 by the host, so a card drawn at that size needs
    // no object-fit to crop it.
    ogp: url('ogp')
  };
}

export const PHOTOS = {
  /** Mount Fuji across the bay, seen over the ridges of the Izu peninsula. */
  fujiFromTheRidge: photo('9d7ef63c-55df-4334-c310-04c13463b800'),
  /** A drink on the railing of a lookout, the city and Fuji beyond it. */
  drinkAtTheLookout: photo('fa1030ad-134d-4335-de4b-532c33b41400'),
  /** The concourse at Paddington, where a journey starts. */
  stationConcourse: photo('b23637c3-4198-4836-6676-77680d0de400'),
  /** Cliffs falling into deep blue water, from the ridge above them. */
  islandCliffs: photo('792a7308-3a2f-43d1-ef5c-5c6bb2333500')
};

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import MapDetailView from '../../../../../components/maps/MapDetailView.tsx';
import { getServerAuthState } from '../../../../../lib/auth.ts';
import { getMyJourney, getMyJourneys } from '../../../../../lib/journeys.ts';
import {
  getMap,
  getMapChapters,
  getMapCoauthors,
  getMapReviews
} from '../../../../../lib/maps.ts';
import { getMyProfile } from '../../../../../lib/users.ts';
import { getDictionary } from '../../../../../utils/getDictionary.ts';
import { localePath } from '../../../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string; mapId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, mapId } = await params;
  const dict = getDictionary(lang);
  const map = await getMap(mapId, lang);

  const title = map ? `${map.name} | Qoodish` : 'Qoodish';
  const description = map ? map.description : dict['meta description'];
  const keywords = `${
    map ? `${map.name}, ` : ''
  }Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`;
  const thumbnailUrl = map?.image?.ogp ?? defaultOgImage(lang);
  const path = `/maps/${mapId}`;

  return {
    title,
    description,
    keywords,
    robots: map ? undefined : 'noindex',
    alternates: buildAlternates(lang, path),
    openGraph: {
      type: 'website',
      title,
      description,
      url: localePath(lang, path),
      images: ogImages(thumbnailUrl),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function MapPage({ params }: Props) {
  const { lang, mapId } = await params;
  const { token } = await getServerAuthState();
  const [map, reviews, coauthors, chapters, profile, journeys] =
    await Promise.all([
      getMap(mapId, lang, token),
      getMapReviews(mapId, lang, token),
      getMapCoauthors(mapId, lang, token),
      getMapChapters(mapId, lang, token),
      getMyProfile(lang, token),
      getMyJourneys(lang, token)
    ]);

  if (!map) {
    notFound();
  }

  const currentSummary = journeys.find(
    (journey) => journey.map_id === map.id && !journey.finished_at
  );
  const currentJourney = currentSummary
    ? await getMyJourney(String(currentSummary.id), lang, token)
    : null;

  return (
    <Suspense>
      <MapDetailView
        map={map}
        reviews={reviews}
        coauthors={coauthors}
        chapters={chapters}
        currentProfile={profile}
        currentJourney={currentJourney}
      />
    </Suspense>
  );
}

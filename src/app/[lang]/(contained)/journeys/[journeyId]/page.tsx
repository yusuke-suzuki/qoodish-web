import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JourneyDetailView from '../../../../../components/journeys/JourneyDetailView';
import { getServerAuthState } from '../../../../../lib/auth';
import { getChapter } from '../../../../../lib/chapters';
import { getMyJourney } from '../../../../../lib/journeys';
import { getMap, getMapReviews } from '../../../../../lib/maps';
import { getDictionary } from '../../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string; journeyId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return {
    title: `${dict['journey log']} | Qoodish`,
    robots: 'noindex'
  };
}

export default async function JourneyPage({ params }: Props) {
  const { lang, journeyId } = await params;
  const { authenticated, token } = await getServerAuthState();

  if (!authenticated) {
    notFound();
  }

  const journey = await getMyJourney(journeyId, lang, token);

  if (!journey) {
    notFound();
  }

  // The map can be gone or out of reach by now; the journey outlives it.
  const mapId = journey.map_id;

  const [map, reviews, chapter] = await Promise.all([
    mapId ? getMap(String(mapId), lang, token) : null,
    mapId ? getMapReviews(String(mapId), lang, token) : [],
    journey.chapter_id ? getChapter(journey.chapter_id, lang, token) : null
  ]);

  return (
    <JourneyDetailView
      journey={journey}
      chapter={chapter}
      map={map}
      reviews={reviews}
    />
  );
}

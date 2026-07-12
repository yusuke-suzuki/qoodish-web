import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JourneyDetailView from '../../../../../../../components/journeys/JourneyDetailView';
import { getServerAuthState } from '../../../../../../../lib/auth';
import { getChapter } from '../../../../../../../lib/chapters';
import { getMyJourney } from '../../../../../../../lib/journeys';
import { getMap } from '../../../../../../../lib/maps';
import { getDictionary } from '../../../../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string; mapId: string; journeyId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, mapId } = await params;
  const dict = getDictionary(lang);
  const map = await getMap(mapId, lang);

  return {
    title: map ? `${dict.journeys} - ${map.name} | Qoodish` : 'Qoodish',
    robots: 'noindex'
  };
}

export default async function JourneyPage({ params }: Props) {
  const { lang, mapId, journeyId } = await params;
  const { token } = await getServerAuthState();
  const [map, journey] = await Promise.all([
    getMap(mapId, lang, token),
    getMyJourney(journeyId, lang, token)
  ]);

  if (!map || !journey) {
    notFound();
  }

  const chapter = journey.chapter_id
    ? await getChapter(journey.chapter_id, lang, token)
    : null;

  return <JourneyDetailView journey={journey} chapter={chapter} map={map} />;
}

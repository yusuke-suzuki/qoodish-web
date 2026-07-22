import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ChapterEditor from '../../../../../../components/chapters/ChapterEditor';
import { getServerAuthState } from '../../../../../../lib/auth';
import { getChapter, getUserChapters } from '../../../../../../lib/chapters';
import { getMyJourney } from '../../../../../../lib/journeys';
import { getMap, getMapReviews } from '../../../../../../lib/maps';
import { getUserJournal } from '../../../../../../lib/users';
import { getDictionary } from '../../../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string; chapterId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return {
    title: `${dict.edit} | Qoodish`,
    robots: 'noindex'
  };
}

export default async function ChapterEditPage({ params }: Props) {
  const { lang, chapterId } = await params;
  const { token } = await getServerAuthState();

  if (!token) {
    notFound();
  }

  const chapter = await getChapter(chapterId, lang, token);

  if (!chapter) {
    notFound();
  }

  if (!chapter.editable) {
    redirect(`/${lang}/chapters/${chapterId}`);
  }

  // Deleting a map nullifies the chapters on it, so the chapter outlives it.
  const mapId = chapter.map_id;

  const [map, authorChapters, journey, reviews, authorJournal] =
    await Promise.all([
      mapId ? getMap(String(mapId), lang, token) : null,
      getUserChapters(chapter.author.id, lang, token),
      chapter.journey_id
        ? getMyJourney(String(chapter.journey_id), lang, token)
        : null,
      mapId ? getMapReviews(String(mapId), lang, token) : [],
      getUserJournal(String(chapter.author.id), lang, token)
    ]);

  return (
    <ChapterEditor
      chapter={chapter}
      map={map}
      journey={journey}
      reviews={reviews}
      authorJournal={authorJournal}
      authorPageCount={authorChapters.length}
    />
  );
}

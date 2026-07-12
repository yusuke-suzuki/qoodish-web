import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ChapterEditorView from '../../../../../../../components/chapters/ChapterEditorView';
import { getServerAuthState } from '../../../../../../../lib/auth';
import { getChapter, getUserChapters } from '../../../../../../../lib/chapters';
import { getMap, getMapReviews } from '../../../../../../../lib/maps';
import { getDictionary } from '../../../../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string; mapId: string; chapterId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, mapId, chapterId } = await params;
  const dict = getDictionary(lang);
  const [map, chapter] = await Promise.all([
    getMap(mapId, lang),
    getChapter(chapterId, lang)
  ]);

  return {
    title: chapter?.title
      ? `${chapter.title} | Qoodish`
      : map
        ? `${dict.journal} - ${map.name} | Qoodish`
        : 'Qoodish',
    robots: chapter?.status === 'published' ? undefined : 'noindex'
  };
}

export default async function ChapterPage({ params }: Props) {
  const { lang, mapId, chapterId } = await params;
  const { token } = await getServerAuthState();
  const [map, reviews, chapter] = await Promise.all([
    getMap(mapId, lang, token),
    getMapReviews(mapId, lang, token),
    getChapter(chapterId, lang, token)
  ]);

  if (!map || !chapter) {
    notFound();
  }

  const authorChapters = await getUserChapters(chapter.author.id, lang, token);

  return (
    <ChapterEditorView
      chapter={chapter}
      map={map}
      reviews={reviews}
      authorPageCount={authorChapters.length}
    />
  );
}

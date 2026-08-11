import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ChapterReadView from '../../../../../components/chapters/ChapterReadView';
import { getServerAuthState } from '../../../../../lib/auth';
import { getChapter, getUserChapters } from '../../../../../lib/chapters';
import { getMap } from '../../../../../lib/maps';
import { getUserJournal } from '../../../../../lib/users';
import { getDictionary } from '../../../../../utils/getDictionary';
import { localePath } from '../../../../../utils/locales';
import { buildAlternates, defaultOgImage } from '../../../../../utils/metadata';

type Props = {
  params: Promise<{ lang: string; chapterId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, chapterId } = await params;
  const dict = getDictionary(lang);
  const chapter = await getChapter(chapterId, lang);

  const title = chapter
    ? `${chapter.title || dict['untitled chapter']} | Qoodish`
    : 'Qoodish';
  const description = dict['meta description'];
  const keywords = `${
    chapter?.title ? `${chapter.title}, ` : ''
  }Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`;
  const thumbnailUrl = chapter?.image?.ogp ?? defaultOgImage(lang);
  const path = `/chapters/${chapterId}`;

  return {
    title,
    description,
    keywords,
    robots: chapter?.status === 'published' ? undefined : 'noindex',
    alternates: buildAlternates(lang, path),
    openGraph: {
      title,
      description,
      url: localePath(lang, path),
      images: [{ url: thumbnailUrl }],
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function ChapterPage({ params }: Props) {
  const { lang, chapterId } = await params;
  const { token } = await getServerAuthState();
  const chapter = await getChapter(chapterId, lang, token);

  if (!chapter) {
    notFound();
  }

  // Deleting a map nullifies the chapters on it, so the chapter outlives it.
  const [map, authorChapters, authorJournal] = await Promise.all([
    chapter.map_id ? getMap(String(chapter.map_id), lang, token) : null,
    getUserChapters(chapter.author.id, lang, token),
    getUserJournal(String(chapter.author.id), lang, token)
  ]);

  return (
    <ChapterReadView
      chapter={chapter}
      map={map}
      authorJournal={authorJournal}
      authorPageCount={authorChapters.length}
    />
  );
}

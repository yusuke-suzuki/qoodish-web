import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookmarksView from '../../../../components/bookmarks/BookmarksView';
import { getServerAuthState } from '../../../../lib/auth';
import {
  getBookmarkedJournals,
  getBookmarkedMaps
} from '../../../../lib/users';
import { getDictionary } from '../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return {
    title: `${dict.bookmarks} | Qoodish`,
    robots: 'noindex'
  };
}

export default async function BookmarksPage({ params }: Props) {
  const { lang } = await params;
  const { authenticated, token } = await getServerAuthState();

  if (!authenticated) {
    notFound();
  }

  const [maps, journals] = await Promise.all([
    getBookmarkedMaps(lang, token),
    getBookmarkedJournals(lang, token)
  ]);

  return <BookmarksView maps={maps} journals={journals} />;
}

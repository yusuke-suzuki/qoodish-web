import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UserProfile from '../../../../../components/profiles/UserProfile.tsx';
import { getServerAuthState } from '../../../../../lib/auth.ts';
import { getMyChapters, getUserChapters } from '../../../../../lib/chapters.ts';
import {
  getMyJournal,
  getMyMaps,
  getMyReviews,
  getProfile,
  getUserJournal,
  getUserMaps,
  getUserReviews
} from '../../../../../lib/users.ts';
import { getDictionary } from '../../../../../utils/getDictionary.ts';
import { localePath } from '../../../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string; userId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, userId } = await params;
  const dict = getDictionary(lang);
  const description = dict['meta description'];
  const thumbnailUrl = defaultOgImage(lang);
  const path = `/users/${userId}`;

  return {
    title: 'Qoodish',
    description,
    robots: 'noindex',
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip',
    alternates: buildAlternates(lang, path),
    openGraph: {
      type: 'website',
      title: 'Qoodish',
      description,
      url: localePath(lang, path),
      images: ogImages(thumbnailUrl),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary'
    }
  };
}

export default async function UserPage({ params }: Props) {
  const { lang, userId } = await params;
  const { token, uid } = await getServerAuthState();
  const profile = await getProfile(userId, lang, token);

  if (!profile) {
    notFound();
  }

  const isOwnProfile = Boolean(uid && profile.uid === uid);

  const [initialReviews, maps, journal, chapters] = await Promise.all([
    isOwnProfile ? getMyReviews(lang) : getUserReviews(userId, lang),
    isOwnProfile ? getMyMaps(lang, token) : getUserMaps(userId, lang, token),
    isOwnProfile
      ? getMyJournal(lang, token)
      : getUserJournal(userId, lang, token),
    isOwnProfile
      ? getMyChapters(lang, token)
      : getUserChapters(userId, lang, token)
  ]);

  return (
    <UserProfile
      profile={profile}
      initialReviews={initialReviews}
      maps={maps}
      journal={journal}
      chapters={chapters}
    />
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UserProfile from '../../../../../components/profiles/UserProfile';
import { getServerAuthState } from '../../../../../lib/auth';
import { getMyChapters, getUserChapters } from '../../../../../lib/chapters';
import {
  getProfile,
  getUserBookmarks,
  getUserMaps,
  getUserReviews
} from '../../../../../lib/users';
import { getDictionary } from '../../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string; userId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, userId } = await params;
  const dict = getDictionary(lang);
  const description = dict['meta description'];
  const thumbnailUrl =
    lang === 'en'
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;
  const endpoint = `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;

  return {
    title: 'Qoodish',
    description,
    robots: 'noindex',
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip',
    alternates: {
      canonical: `${endpoint}/${lang}/users/${userId}`,
      languages: {
        en: `${endpoint}/en/users/${userId}`,
        ja: `${endpoint}/ja/users/${userId}`,
        'x-default': `${endpoint}/en/users/${userId}`
      }
    },
    openGraph: {
      title: 'Qoodish',
      description,
      url: `${endpoint}/${lang}/users/${userId}`,
      images: [{ url: thumbnailUrl }],
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

  const [initialReviews, maps, bookmarks, chapters] = await Promise.all([
    getUserReviews(userId, lang),
    getUserMaps(userId, lang, token),
    getUserBookmarks(userId, lang, token),
    isOwnProfile
      ? getMyChapters(lang, token)
      : getUserChapters(userId, lang, token)
  ]);

  return (
    <UserProfile
      profile={profile}
      initialReviews={initialReviews}
      maps={maps}
      bookmarks={bookmarks}
      chapters={chapters}
    />
  );
}

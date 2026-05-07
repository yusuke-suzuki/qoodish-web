import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import UserProfile from '../../../../../components/profiles/UserProfile';
import {
  getProfile,
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
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;

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
  const cookieStore = await cookies();
  const token = cookieStore.get('__session')?.value;
  const profile = await getProfile(userId, lang, token);

  if (!profile) {
    notFound();
  }

  const [initialReviews, maps] = await Promise.all([
    getUserReviews(userId, lang),
    getUserMaps(userId, lang, token)
  ]);

  return (
    <UserProfile
      profile={profile}
      initialReviews={initialReviews}
      maps={maps}
    />
  );
}

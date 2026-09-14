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

// A profile is shared under the person's own name and picture: the service
// asks people to write under their name, so a card that says only "Qoodish"
// would be backwards.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, userId } = await params;
  const dict = getDictionary(lang);
  const profile = await getProfile(userId, lang);

  const title = profile ? `${profile.name} | Qoodish` : 'Qoodish';
  const description = profile?.biography || dict['meta description'];
  const thumbnailUrl = profile?.image?.ogp ?? defaultOgImage(lang);
  const path = `/users/${userId}`;

  return {
    title,
    description,
    robots: 'noindex',
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip',
    alternates: buildAlternates(lang, path),
    openGraph: {
      type: 'profile',
      title,
      description,
      url: localePath(lang, path),
      images: ogImages(thumbnailUrl, profile?.name ?? dict['meta headline']),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
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

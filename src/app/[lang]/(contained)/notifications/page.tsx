import type { Metadata } from 'next';
import NotificationsFeed from '../../../../components/notifications/NotificationsFeed.tsx';
import { getNotifications } from '../../../../lib/users.ts';
import { getDictionary } from '../../../../utils/getDictionary.ts';
import { localePath } from '../../../../utils/locales.ts';
import { buildAlternates, defaultOgImage } from '../../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.notifications} | Qoodish`;
  const description = dict['meta description'];
  const thumbnailUrl = defaultOgImage(lang);

  return {
    title,
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: buildAlternates(lang, '/notifications'),
    openGraph: {
      title,
      description,
      url: localePath(lang, '/notifications'),
      images: [{ url: thumbnailUrl }],
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function NotificationsPage({ params }: Props) {
  const { lang } = await params;
  const notifications = await getNotifications(lang);

  return <NotificationsFeed notifications={notifications} />;
}

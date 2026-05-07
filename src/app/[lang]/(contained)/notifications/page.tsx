import type { Metadata } from 'next';
import NotificationsFeed from '../../../../components/notifications/NotificationsFeed';
import { getNotifications } from '../../../../lib/users';
import { getDictionary } from '../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.notifications} | Qoodish`;
  const description = dict['meta description'];
  const thumbnailUrl =
    lang === 'en'
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;

  return {
    title,
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: {
      canonical: `${endpoint}/${lang}/notifications`,
      languages: {
        en: `${endpoint}/en/notifications`,
        ja: `${endpoint}/ja/notifications`,
        'x-default': `${endpoint}/en/notifications`
      }
    },
    openGraph: {
      title,
      description,
      url: `${endpoint}/${lang}/notifications`,
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

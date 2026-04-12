import { Stack } from '@mui/material';
import type { Metadata } from 'next';
import AccountEmailCard from '../../../../components/settings/AccountEmailCard';
import DeleteAccountCard from '../../../../components/settings/DeleteAccountCard';
import ProvidersCard from '../../../../components/settings/ProvidersCard';
import PushNotificationsCard from '../../../../components/settings/PushNotificationsCard';
import { getDictionary } from '../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.settings} | Qoodish`;
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
      canonical: `${endpoint}/${lang}/settings`,
      languages: {
        en: `${endpoint}/en/settings`,
        ja: `${endpoint}/ja/settings`,
        'x-default': `${endpoint}/en/settings`
      }
    },
    openGraph: {
      title,
      description,
      url: `${endpoint}/${lang}/settings`,
      images: [{ url: thumbnailUrl }],
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function SettingsPage({ params }: Props) {
  const { lang } = await params;

  return (
    <Stack spacing={3}>
      <AccountEmailCard />
      <PushNotificationsCard />
      <ProvidersCard />
      <DeleteAccountCard />
    </Stack>
  );
}

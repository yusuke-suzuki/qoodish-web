import { Stack } from '@mui/material';
import type { Metadata } from 'next';
import AccountEmailCard from '../../../../components/settings/AccountEmailCard';
import DeleteAccountCard from '../../../../components/settings/DeleteAccountCard';
import ProvidersCard from '../../../../components/settings/ProvidersCard';
import PushNotificationsCard from '../../../../components/settings/PushNotificationsCard';
import { getDictionary } from '../../../../utils/getDictionary';
import { localePath } from '../../../../utils/locales';
import { buildAlternates } from '../../../../utils/metadata';

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

  return {
    title,
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: buildAlternates(lang, '/settings'),
    openGraph: {
      title,
      description,
      url: localePath(lang, '/settings'),
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

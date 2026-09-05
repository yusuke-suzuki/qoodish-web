import { Stack } from '@mui/material';
import type { Metadata } from 'next';
import AccountEmailCard from '../../../../components/settings/AccountEmailCard.tsx';
import DeleteAccountCard from '../../../../components/settings/DeleteAccountCard.tsx';
import ProvidersCard from '../../../../components/settings/ProvidersCard.tsx';
import PushNotificationsCard from '../../../../components/settings/PushNotificationsCard.tsx';
import { getDictionary } from '../../../../utils/getDictionary.ts';
import { localePath } from '../../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.settings} | Qoodish`;
  const description = dict['meta description'];
  const thumbnailUrl = defaultOgImage(lang);

  return {
    title,
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: buildAlternates(lang, '/settings'),
    openGraph: {
      type: 'website',
      title,
      description,
      url: localePath(lang, '/settings'),
      images: ogImages(thumbnailUrl),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function SettingsPage() {
  return (
    <Stack spacing={3}>
      <AccountEmailCard />
      <PushNotificationsCard />
      <ProvidersCard />
      <DeleteAccountCard />
    </Stack>
  );
}

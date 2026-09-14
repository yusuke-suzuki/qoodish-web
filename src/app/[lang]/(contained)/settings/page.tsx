import { Stack } from '@mui/material';
import type { Metadata } from 'next';
import AccountEmailCard from '../../../../components/settings/AccountEmailCard.tsx';
import DeleteAccountCard from '../../../../components/settings/DeleteAccountCard.tsx';
import ProvidersCard from '../../../../components/settings/ProvidersCard.tsx';
import PushNotificationsCard from '../../../../components/settings/PushNotificationsCard.tsx';
import { getDictionary } from '../../../../utils/getDictionary.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return {
    title: `${dict.settings} | Qoodish`,
    robots: 'noindex'
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

'use client';

import { Stack } from '@mui/material';
import Layout from '../../../components/Layout';
import AccountEmailCard from '../../../components/settings/AccountEmailCard';
import DeleteAccountCard from '../../../components/settings/DeleteAccountCard';
import ProvidersCard from '../../../components/settings/ProvidersCard';
import PushNotificationsCard from '../../../components/settings/PushNotificationsCard';

export default function SettingsPageClient() {
  return (
    <Layout>
      <Stack spacing={3}>
        <AccountEmailCard />
        <PushNotificationsCard />
        <ProvidersCard />
        <DeleteAccountCard />
      </Stack>
    </Layout>
  );
}

'use client';

import { Stack } from '@mui/material';
import type { AppMap } from '../../../../types';
import Layout from '../../../components/Layout';
import Sidebar from '../../../components/layouts/Sidebar';
import AccountEmailCard from '../../../components/settings/AccountEmailCard';
import DeleteAccountCard from '../../../components/settings/DeleteAccountCard';
import ProvidersCard from '../../../components/settings/ProvidersCard';
import PushNotificationsCard from '../../../components/settings/PushNotificationsCard';

type Props = {
  popularMaps: AppMap[];
};

export default function SettingsPageClient({ popularMaps }: Props) {
  return (
    <Layout sidebar={<Sidebar popularMaps={popularMaps} />}>
      <Stack spacing={3}>
        <AccountEmailCard />
        <PushNotificationsCard />
        <ProvidersCard />
        <DeleteAccountCard />
      </Stack>
    </Layout>
  );
}

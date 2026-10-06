import { Stack } from '@mui/material';
import type { Metadata } from 'next';
import AccountEmailCard from '../../../../components/settings/AccountEmailCard.tsx';
import BlockedAccountsCard from '../../../../components/settings/BlockedAccountsCard.tsx';
import DeleteAccountCard from '../../../../components/settings/DeleteAccountCard.tsx';
import MutedAccountsCard from '../../../../components/settings/MutedAccountsCard.tsx';
import ProvidersCard from '../../../../components/settings/ProvidersCard.tsx';
import PushNotificationsCard from '../../../../components/settings/PushNotificationsCard.tsx';
import { getServerAuthState } from '../../../../lib/auth.ts';
import { getBlockedAccounts, getMutedAccounts } from '../../../../lib/users.ts';
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

export default async function SettingsPage({ params }: Props) {
  const { lang } = await params;
  const { token } = await getServerAuthState();
  const noAccounts = { items: [], nextCursor: null };
  const [mutedAccounts, blockedAccounts] = token
    ? await Promise.all([getMutedAccounts(lang), getBlockedAccounts(lang)])
    : [noAccounts, noAccounts];

  return (
    <Stack spacing={3}>
      <AccountEmailCard />
      <PushNotificationsCard />
      {token && (
        <>
          <MutedAccountsCard
            accounts={mutedAccounts.items}
            nextCursor={mutedAccounts.nextCursor}
          />
          <BlockedAccountsCard
            accounts={blockedAccounts.items}
            nextCursor={blockedAccounts.nextCursor}
          />
        </>
      )}
      <ProvidersCard />
      <DeleteAccountCard />
    </Stack>
  );
}

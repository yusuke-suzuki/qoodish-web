'use client';

import { Button, Card, CardContent, List, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
import type { MutedAccount } from '../../../types/index.ts';
import { fetchMoreMutedAccounts } from '../../actions/mutes.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import MutedAccountItem from './MutedAccountItem.tsx';

type Props = {
  accounts: MutedAccount[];
};

function MutedAccountsCard({ accounts }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  const [moreAccounts, setMoreAccounts] = useState<MutedAccount[]>([]);
  const [unmutedIds, setUnmutedIds] = useState<number[]>([]);
  const [noMoreResults, setNoMoreResults] = useState(accounts.length < 1);
  const [isPending, startTransition] = useTransition();

  const loaded = [...accounts, ...moreAccounts];
  const shown = loaded.filter(
    (account, index) =>
      !unmutedIds.includes(account.id) &&
      loaded.findIndex((other) => other.id === account.id) === index
  );

  const handleUnmuted = (userId: number) => {
    setUnmutedIds((prev) => [...prev, userId]);
  };

  const loadMore = () => {
    const last = loaded[loaded.length - 1];

    if (noMoreResults || isPending || !last) {
      return;
    }

    startTransition(async () => {
      try {
        const next = await fetchMoreMutedAccounts(lang, last.cursor);
        setMoreAccounts((prev) => [...prev, ...next]);
        setNoMoreResults(next.length < 1);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {dictionary['muted accounts']}
        </Typography>
        <Typography component="p" color="text.secondary">
          {dictionary['muted accounts detail']}
        </Typography>

        {shown.length > 0 ? (
          <List>
            {shown.map((account) => (
              <MutedAccountItem
                key={account.id}
                account={account}
                onUnmuted={handleUnmuted}
              />
            ))}
          </List>
        ) : (
          <Typography component="p" color="text.secondary" sx={{ mt: 2 }}>
            {dictionary['no muted accounts']}
          </Typography>
        )}

        {!noMoreResults && (
          <Button
            onClick={loadMore}
            color="secondary"
            loading={isPending}
            fullWidth
          >
            {dictionary['load more']}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(MutedAccountsCard);

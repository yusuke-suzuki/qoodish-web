'use client';

import { Button, Card, CardContent, List, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
import type { MutedAccount } from '../../../types/index.ts';
import { fetchMoreMutedAccounts } from '../../actions/mutes.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLoadMoreOnVisible from '../../hooks/useLoadMoreOnVisible.ts';
import MutedAccountItem from './MutedAccountItem.tsx';

type Props = {
  accounts: MutedAccount[];
  nextCursor: string | null;
};

function MutedAccountsCard({ accounts, nextCursor }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  const [moreAccounts, setMoreAccounts] = useState<MutedAccount[]>([]);
  const [moreCursor, setMoreCursor] = useState<string | null>();
  const [unmutedIds, setUnmutedIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  const cursor = moreCursor === undefined ? nextCursor : moreCursor;
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
    if (!cursor || isPending) {
      return;
    }

    startTransition(async () => {
      try {
        const page = await fetchMoreMutedAccounts(lang, cursor);
        setMoreAccounts((prev) => [...prev, ...page.items]);
        setMoreCursor(page.nextCursor);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

  const loadMoreRef = useLoadMoreOnVisible<HTMLButtonElement>(
    loadMore,
    !!cursor && !isPending,
    cursor
  );

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

        {cursor && (
          <Button
            ref={loadMoreRef}
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

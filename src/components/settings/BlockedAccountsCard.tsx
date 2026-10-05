'use client';

import { Button, Card, CardContent, List, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
import type { BlockedAccount } from '../../../types/index.ts';
import { fetchMoreBlockedAccounts } from '../../actions/blocks.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLoadMoreOnVisible from '../../hooks/useLoadMoreOnVisible.ts';
import BlockedAccountItem from './BlockedAccountItem.tsx';

type Props = {
  accounts: BlockedAccount[];
  nextCursor: string | null;
};

function BlockedAccountsCard({ accounts, nextCursor }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  const [moreAccounts, setMoreAccounts] = useState<BlockedAccount[]>([]);
  const [moreCursor, setMoreCursor] = useState<string | null>();
  const [unblockedIds, setUnblockedIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  const cursor = moreCursor === undefined ? nextCursor : moreCursor;
  const loaded = [...accounts, ...moreAccounts];
  const shown = loaded.filter(
    (account, index) =>
      !unblockedIds.includes(account.id) &&
      loaded.findIndex((other) => other.id === account.id) === index
  );

  const handleUnblocked = (userId: number) => {
    setUnblockedIds((prev) => [...prev, userId]);
  };

  const loadMore = () => {
    if (!cursor || isPending) {
      return;
    }

    startTransition(async () => {
      try {
        const page = await fetchMoreBlockedAccounts(lang, cursor);
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
          {dictionary['blocked accounts']}
        </Typography>
        <Typography component="p" color="text.secondary">
          {dictionary['blocked accounts detail']}
        </Typography>

        {shown.length > 0 ? (
          <List>
            {shown.map((account) => (
              <BlockedAccountItem
                key={account.id}
                account={account}
                onUnblocked={handleUnblocked}
              />
            ))}
          </List>
        ) : (
          <Typography component="p" color="text.secondary" sx={{ mt: 2 }}>
            {dictionary['no blocked accounts']}
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

export default memo(BlockedAccountsCard);

import { Reviews } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
import type { Pin } from '../../../types/index.ts';
import { fetchMoreMyPins, fetchMoreUserPins } from '../../actions/pins.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLoadMoreOnVisible from '../../hooks/useLoadMoreOnVisible.ts';
import LoadingStatus from '../common/LoadingStatus.tsx';
import NoContents from '../common/NoContents.tsx';
import PinGridList from '../pins/PinGridList.tsx';

type Props = {
  userId: number;
  initialPins: Pin[];
  nextCursor: string | null;
  isOwnProfile: boolean;
};

export default memo(function UserPins({
  userId,
  initialPins,
  nextCursor,
  isOwnProfile
}: Props) {
  const dictionary = useDictionary();

  const [pins, setPins] = useState(initialPins);
  const [cursor, setCursor] = useState(nextCursor);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    if (!cursor || isPending) return;

    startTransition(async () => {
      try {
        const page = isOwnProfile
          ? await fetchMoreMyPins(cursor)
          : await fetchMoreUserPins(userId, cursor);
        setPins((prev) => [...prev, ...page.items]);
        setCursor(page.nextCursor);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

  const canLoadMore = !isPending && !!cursor && pins.length > 0;
  const loadMoreRef = useLoadMoreOnVisible<HTMLButtonElement>(
    loadMore,
    canLoadMore,
    cursor
  );

  return (
    <>
      {pins.length < 1 && !isPending && (
        <NoContents message={dictionary['pins will see here']} icon={Reviews} />
      )}

      <LoadingStatus loading={isPending} />

      <PinGridList pins={pins} loading={isPending} />

      <Stack alignItems="center" sx={{ mt: 2 }}>
        {canLoadMore && (
          <Button ref={loadMoreRef} onClick={loadMore} color="secondary">
            {dictionary['load more']}
          </Button>
        )}
      </Stack>
    </>
  );
});

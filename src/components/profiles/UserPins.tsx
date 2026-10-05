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
  isOwnProfile: boolean;
};

export default memo(function UserPins({
  userId,
  initialPins,
  isOwnProfile
}: Props) {
  const dictionary = useDictionary();

  const [pins, setPins] = useState(initialPins);
  const [noMoreResults, setNoMoreResults] = useState(initialPins.length < 1);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    if (noMoreResults || isPending) return;

    const lastPin = pins[pins.length - 1];
    if (!lastPin) {
      setNoMoreResults(true);
      return;
    }

    startTransition(async () => {
      try {
        const morePins = isOwnProfile
          ? await fetchMoreMyPins(lastPin.created_at)
          : await fetchMoreUserPins(userId, lastPin.created_at);
        setPins((prev) => [...prev, ...morePins]);
        setNoMoreResults(morePins.length < 1);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

  const canLoadMore = !isPending && !noMoreResults && pins.length > 0;
  const loadMoreRef = useLoadMoreOnVisible<HTMLButtonElement>(
    loadMore,
    canLoadMore
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

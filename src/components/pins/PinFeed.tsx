'use client';

import { Reviews } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
import type { Pin } from '../../../types/index.ts';
import { fetchMorePinFeed } from '../../actions/pins.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import LoadingStatus from '../common/LoadingStatus.tsx';
import NoContents from '../common/NoContents.tsx';
import PinGridList from './PinGridList.tsx';

type Props = {
  initialPins: Pin[];
};

export default memo(function PinFeed({ initialPins }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  const [pins, setPins] = useState(initialPins);
  const [noMoreResults, setNoMoreResults] = useState(initialPins.length < 1);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    const lastPin = pins[pins.length - 1];

    if (noMoreResults || isPending || !lastPin) {
      return;
    }

    startTransition(async () => {
      try {
        const morePins = await fetchMorePinFeed(
          lang,
          lastPin.created_at,
          lastPin.id
        );
        setPins((prev) => [...prev, ...morePins]);
        setNoMoreResults(morePins.length < 1);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

  if (pins.length < 1) {
    return <NoContents icon={Reviews} message={dictionary['no pins yet']} />;
  }

  return (
    <>
      <LoadingStatus loading={isPending} />

      <PinGridList pins={pins} loading={isPending} />

      <Stack alignItems="center" sx={{ mt: 2 }}>
        {!isPending && !noMoreResults && (
          <Button onClick={loadMore} color="secondary">
            {dictionary['load more']}
          </Button>
        )}
      </Stack>
    </>
  );
});

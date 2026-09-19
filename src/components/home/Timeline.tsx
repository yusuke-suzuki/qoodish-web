'use client';

import { Reviews } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
import type { Pin } from '../../../types/index.ts';
import { fetchMoreTimelinePins } from '../../actions/pins.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import CreateMapButton from '../common/CreateMapButton.tsx';
import DiscoverButton from '../common/DiscoverButton.tsx';
import IssueDialog from '../common/IssueDialog.tsx';
import LoadingStatus from '../common/LoadingStatus.tsx';
import NoContents from '../common/NoContents.tsx';
import TimelinePinCard from './TimelinePinCard.tsx';
import TimelinePinCardSkeleton from './TimelinePinCardSkeleton.tsx';

type Props = {
  initialPins: Pin[];
};

type IssueReportOptions = {
  contentId: number | null;
  dialogOpen: boolean;
};

const skeletonKeys = ['skeleton-1', 'skeleton-2'];

export default memo(function Timeline({ initialPins }: Props) {
  const dictionary = useDictionary();

  const [pins, setPins] = useState(initialPins);
  const [noMoreResults, setNoMoreResults] = useState(initialPins.length < 1);
  const [isPending, startTransition] = useTransition();

  const [issueReportOptions, setIssueReportOptions] =
    useState<IssueReportOptions>({
      contentId: null,
      dialogOpen: false
    });

  const loadMore = () => {
    if (noMoreResults || isPending) return;

    const lastPin = pins[pins.length - 1];
    if (!lastPin) {
      setNoMoreResults(true);
      return;
    }

    startTransition(async () => {
      try {
        const morePins = await fetchMoreTimelinePins(lastPin.created_at);
        setPins((prev) => [...prev, ...morePins]);
        setNoMoreResults(morePins.length < 1);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

  const handleReportClick = (pin: Pin) => {
    setIssueReportOptions({
      contentId: pin.id,
      dialogOpen: true
    });
  };

  const handleIssueDialogClose = () => {
    setIssueReportOptions({
      contentId: null,
      dialogOpen: false
    });
  };

  return (
    <>
      {pins.length < 1 && !isPending && (
        <NoContents
          message={dictionary['empty timeline']}
          icon={Reviews}
          action={
            <>
              <DiscoverButton />
              <CreateMapButton />
            </>
          }
        />
      )}

      <LoadingStatus loading={isPending} />

      <Box sx={{ display: 'grid', gap: 3 }} aria-busy={isPending}>
        {pins.map((pin) => (
          <TimelinePinCard
            key={pin.id}
            pin={pin}
            onReportClick={handleReportClick}
          />
        ))}

        {isPending &&
          skeletonKeys.map((key) => <TimelinePinCardSkeleton key={key} />)}
      </Box>

      <Stack alignItems="center" sx={{ mt: 2 }}>
        {!isPending && !noMoreResults && pins.length > 0 && (
          <Button onClick={loadMore} color="secondary">
            {dictionary['load more']}
          </Button>
        )}
      </Stack>

      <IssueDialog
        open={issueReportOptions.dialogOpen}
        onClose={handleIssueDialogClose}
        contentType="pin"
        contentId={issueReportOptions.contentId}
      />
    </>
  );
});

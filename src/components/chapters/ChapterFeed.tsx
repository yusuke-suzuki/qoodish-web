'use client';

import { HistoryEdu } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
import type { Chapter } from '../../../types/index.ts';
import { fetchMoreChapterFeed } from '../../actions/chapters.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLoadMoreOnVisible from '../../hooks/useLoadMoreOnVisible.ts';
import LoadingStatus from '../common/LoadingStatus.tsx';
import NoContents from '../common/NoContents.tsx';
import ChapterList from './ChapterList.tsx';

type Props = {
  initialChapters: Chapter[];
};

export default memo(function ChapterFeed({ initialChapters }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  const [chapters, setChapters] = useState(initialChapters);
  const [noMoreResults, setNoMoreResults] = useState(
    initialChapters.length < 1
  );
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    const lastChapter = chapters[chapters.length - 1];

    if (noMoreResults || isPending || !lastChapter) {
      return;
    }

    startTransition(async () => {
      try {
        const moreChapters = await fetchMoreChapterFeed(
          lang,
          lastChapter.created_at,
          lastChapter.id
        );
        setChapters((prev) => [...prev, ...moreChapters]);
        setNoMoreResults(moreChapters.length < 1);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

  const canLoadMore = !isPending && !noMoreResults && chapters.length > 0;
  const loadMoreRef = useLoadMoreOnVisible<HTMLButtonElement>(
    loadMore,
    canLoadMore,
    chapters.length
  );

  if (chapters.length < 1) {
    return (
      <NoContents icon={HistoryEdu} message={dictionary['no chapters yet']} />
    );
  }

  return (
    <>
      <LoadingStatus loading={isPending} />

      <ChapterList chapters={chapters} />

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

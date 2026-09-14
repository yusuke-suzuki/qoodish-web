'use client';

import { HistoryEdu } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
import type { Chapter } from '../../../types/index.ts';
import { fetchMoreChapterFeed } from '../../actions/chapters.ts';
import useDictionary from '../../hooks/useDictionary.ts';
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
          lastChapter.created_at
        );
        setChapters((prev) => [...prev, ...moreChapters]);
        setNoMoreResults(moreChapters.length < 1);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

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
        {!isPending && !noMoreResults && (
          <Button onClick={loadMore} color="secondary" loading={isPending}>
            {dictionary['load more']}
          </Button>
        )}
      </Stack>
    </>
  );
});

'use client';

import { Bookmark, BookmarkBorder } from '@mui/icons-material';
import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useState, useTransition } from 'react';
import type { Journal } from '../../../types';
import {
  bookmarkJournal,
  removeJournalBookmark
} from '../../actions/journalBookmarks';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  journal: Journal;
  fullWidth?: boolean;
  onSaved?: () => void;
};

function JournalBookmarkButton({ journal, fullWidth, onSaved }: Props) {
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const [bookmarking, setBookmarking] = useState(journal.bookmarking);
  const [isPending, startTransition] = useTransition();

  const handleClick = useCallback(() => {
    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    const next = !bookmarking;
    setBookmarking(next);

    startTransition(async () => {
      try {
        const result = next
          ? await bookmarkJournal(journal.id)
          : await removeJournalBookmark(journal.id);

        if (result.success) {
          onSaved?.();
        } else {
          setBookmarking(!next);
          enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
            variant: 'error'
          });
        }
      } catch (_error) {
        setBookmarking(!next);
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    });
  }, [
    authenticated,
    bookmarking,
    journal.id,
    setSignInRequired,
    dictionary,
    onSaved
  ]);

  if (journal.editable) {
    return null;
  }

  return (
    <Button
      loading={isPending}
      disableElevation
      fullWidth={fullWidth}
      variant={bookmarking ? 'outlined' : 'contained'}
      color="secondary"
      startIcon={bookmarking ? <Bookmark /> : <BookmarkBorder />}
      onClick={handleClick}
    >
      {bookmarking ? dictionary.unfollow : dictionary.follow}
    </Button>
  );
}

export default memo(JournalBookmarkButton);

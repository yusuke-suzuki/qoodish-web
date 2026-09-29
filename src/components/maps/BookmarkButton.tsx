import { BookmarkBorder } from '@mui/icons-material';
import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useState, useTransition } from 'react';
import type { AppMap } from '../../../types/index.ts';
import { bookmarkMap } from '../../actions/mapBookmarks.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';

type Props = {
  map: AppMap | null;
  onSaved: () => void;
};

function BookmarkButton({ map, onSaved }: Props) {
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const [bookmarking, setBookmarking] = useState(map?.bookmarking ?? false);
  const [isPending, startTransition] = useTransition();

  const handleClick = useCallback(() => {
    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    setBookmarking(true);

    startTransition(async () => {
      try {
        const result = await bookmarkMap(map?.id);

        if (result.success) {
          onSaved();

          enqueueSnackbar(dictionary['follow map success'], {
            variant: 'success'
          });
        } else {
          setBookmarking(false);
          enqueueSnackbar(result.error, { variant: 'error' });
        }
      } catch (_error) {
        setBookmarking(false);
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    });
  }, [map, authenticated, setSignInRequired, dictionary, onSaved]);

  return (
    <Button
      loading={isPending}
      variant="contained"
      color="secondary"
      size="medium"
      fullWidth
      startIcon={<BookmarkBorder />}
      disabled={!map || bookmarking}
      onClick={handleClick}
    >
      {dictionary.follow}
    </Button>
  );
}

export default memo(BookmarkButton);

import { Bookmark } from '@mui/icons-material';
import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition
} from 'react';
import type { AppMap, Profile } from '../../../types';
import { removeBookmark } from '../../actions/mapBookmarks';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  map: AppMap | null;
  currentProfile: Profile | null;
  onSaved: () => void;
};

function RemoveBookmarkButton({ map, currentProfile, onSaved }: Props) {
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const [bookmarking, setBookmarking] = useState(map?.bookmarking ?? false);
  const [isPending, startTransition] = useTransition();

  const isAuthor = useMemo(() => {
    return currentProfile?.id === map.author.id;
  }, [map, currentProfile]);

  const handleClick = useCallback(() => {
    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    setBookmarking(false);

    startTransition(async () => {
      try {
        const result = await removeBookmark(map?.id);

        if (result.success) {
          onSaved();

          enqueueSnackbar(dictionary['unfollow map success'], {
            variant: 'success'
          });
        } else {
          setBookmarking(true);
          enqueueSnackbar(result.error, { variant: 'error' });
        }
      } catch (_error) {
        setBookmarking(true);
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    });
  }, [map, authenticated, setSignInRequired, dictionary, onSaved]);

  return (
    <Button
      variant="outlined"
      color="inherit"
      size="medium"
      fullWidth
      startIcon={<Bookmark />}
      disabled={!map || !bookmarking || isAuthor}
      onClick={handleClick}
      loading={isPending}
    >
      {dictionary.unfollow}
    </Button>
  );
}

export default memo(RemoveBookmarkButton);

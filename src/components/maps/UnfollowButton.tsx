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
import { unfollowMap } from '../../actions/mapFollowers';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  map: AppMap | null;
  currentProfile: Profile | null;
  onSaved: () => void;
};

function UnfollowButton({ map, currentProfile, onSaved }: Props) {
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const [following, setFollowing] = useState(map?.following ?? false);
  const [isPending, startTransition] = useTransition();

  const isAuthor = useMemo(() => {
    return currentProfile?.id === map.owner.id;
  }, [map, currentProfile]);

  const handleClick = useCallback(() => {
    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    setFollowing(false);

    startTransition(async () => {
      try {
        const result = await unfollowMap(map?.id);

        if (result.success) {
          onSaved();

          enqueueSnackbar(dictionary['unfollow map success'], {
            variant: 'success'
          });
        } else {
          setFollowing(true);
          enqueueSnackbar(result.error, { variant: 'error' });
        }
      } catch (_error) {
        setFollowing(true);
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
      disabled={!map || !following || isAuthor}
      onClick={handleClick}
      loading={isPending}
    >
      {dictionary.unfollow}
    </Button>
  );
}

export default memo(UnfollowButton);

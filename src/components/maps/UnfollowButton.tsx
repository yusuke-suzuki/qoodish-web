import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const isAuthor = useMemo(() => {
    return currentProfile?.id === map.owner.id;
  }, [map, currentProfile]);

  const handleClick = useCallback(async () => {
    if (!authenticated) {
      setSignInRequired(true);

      return;
    }

    setLoading(true);

    try {
      const result = await unfollowMap(map?.id);

      if (result.success) {
        onSaved();

        enqueueSnackbar(dictionary['unfollow map success'], {
          variant: 'success'
        });
      } else {
        enqueueSnackbar(result.error, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [map, authenticated, setSignInRequired, dictionary, onSaved]);

  return (
    <Button
      variant="outlined"
      color="inherit"
      size="medium"
      fullWidth
      disabled={!map || !map.following || isAuthor}
      onClick={handleClick}
      loading={loading}
    >
      {dictionary.unfollow}
    </Button>
  );
}

export default memo(UnfollowButton);

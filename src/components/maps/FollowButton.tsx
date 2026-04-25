import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useState, useTransition } from 'react';
import type { AppMap } from '../../../types';
import { followMap } from '../../actions/mapFollowers';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  map: AppMap | null;
  onSaved: () => void;
};

function FollowButton({ map, onSaved }: Props) {
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const [following, setFollowing] = useState(map?.following ?? false);
  const [isPending, startTransition] = useTransition();

  const handleClick = useCallback(() => {
    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    setFollowing(true);

    startTransition(async () => {
      try {
        const result = await followMap(map?.id);

        if (result.success) {
          onSaved();

          enqueueSnackbar(dictionary['follow map success'], {
            variant: 'success'
          });
        } else {
          setFollowing(false);
          enqueueSnackbar(result.error, { variant: 'error' });
        }
      } catch (_error) {
        setFollowing(false);
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
      disabled={!map || following}
      onClick={handleClick}
    >
      {dictionary.follow}
    </Button>
  );
}

export default memo(FollowButton);

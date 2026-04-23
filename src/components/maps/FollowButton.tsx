import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useState } from 'react';
import type { AppMap } from '../../../types';
import { followMap } from '../../actions/mapFollowers';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  map: AppMap | null;
  onSaved: () => void;
};

function FollowButton({ map, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const handleClick = useCallback(async () => {
    if (!authenticated) {
      setSignInRequired(true);

      return;
    }

    setLoading(true);

    try {
      const result = await followMap(map?.id);

      if (result.success) {
        onSaved();

        enqueueSnackbar(dictionary['follow map success'], {
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
      loading={loading}
      variant="contained"
      color="secondary"
      size="medium"
      fullWidth
      disabled={!map || map.following}
      onClick={handleClick}
    >
      {dictionary.follow}
    </Button>
  );
}

export default memo(FollowButton);

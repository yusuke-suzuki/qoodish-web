import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
import type { AppMap, Profile } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  map: AppMap | null;
  currentProfile: Profile | null;
  onSaved: () => void;
};

function UnfollowButton({ map, currentProfile, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const { currentUser, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const isAuthor = useMemo(() => {
    return currentProfile?.id === map.owner.id;
  }, [map, currentProfile]);

  const handleClick = useCallback(async () => {
    if (!currentUser) {
      setSignInRequired(true);

      return;
    }

    setLoading(true);

    const token = await currentUser.getIdToken();

    const headers = new Headers({
      Accept: 'application/json',
      'Accept-Language': window.navigator.language,
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`
    });

    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/maps/${map?.id}/follow`,
      {
        method: 'DELETE',
        headers: headers
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        onSaved();

        enqueueSnackbar(dictionary['unfollow map success'], {
          variant: 'success'
        });
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [map, currentUser, setSignInRequired, dictionary, onSaved]);

  return (
    <LoadingButton
      variant="outlined"
      color="inherit"
      size="medium"
      fullWidth
      disabled={!map || !map.following || isAuthor}
      onClick={handleClick}
    >
      {dictionary.unfollow}
    </LoadingButton>
  );
}

export default memo(UnfollowButton);

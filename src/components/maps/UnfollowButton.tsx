import { Fab } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useMemo } from 'react';
import { AppMap, Profile } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  map: AppMap | null;
  currentProfile: Profile | null;
};

function UnfollowButton({ map, currentProfile }: Props) {
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
        enqueueSnackbar(dictionary['unfollow map success'], {
          variant: 'success'
        });
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occured'], { variant: 'error' });
    }
  }, [map, currentUser, setSignInRequired, dictionary]);

  return (
    <Fab
      variant="extended"
      color="default"
      size="medium"
      sx={{ width: '100%' }}
      disabled={!map || !map.following || isAuthor}
      onClick={handleClick}
    >
      {dictionary.unfollow}
    </Fab>
  );
}

export default memo(UnfollowButton);

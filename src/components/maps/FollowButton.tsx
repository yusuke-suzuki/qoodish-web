import { Fab } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext } from 'react';
import { AppMap } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  map: AppMap | null;
};

function FollowButton({ map }: Props) {
  const { currentUser, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

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
        method: 'POST',
        headers: headers
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        enqueueSnackbar(dictionary['follow map success'], {
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
      color="secondary"
      size="medium"
      sx={{ width: '100%' }}
      disabled={!map || map.following}
      onClick={handleClick}
    >
      {dictionary.follow}
    </Fab>
  );
}

export default memo(FollowButton);

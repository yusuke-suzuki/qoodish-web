import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useState } from 'react';
import { AppMap } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  map: AppMap | null;
  onSaved: () => void;
};

function FollowButton({ map, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const { currentUser, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

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
        method: 'POST',
        headers: headers
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        onSaved();

        enqueueSnackbar(dictionary['follow map success'], {
          variant: 'success'
        });
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occured'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [map, currentUser, setSignInRequired, dictionary, onSaved]);

  return (
    <LoadingButton
      loading={loading}
      variant="contained"
      color="secondary"
      size="medium"
      fullWidth
      disabled={!map || map.following}
      onClick={handleClick}
    >
      {dictionary.follow}
    </LoadingButton>
  );
}

export default memo(FollowButton);

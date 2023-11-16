import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Checkbox, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, memo, useCallback, useContext, useState } from 'react';
import { Review } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  review: Review;
};

export default memo(function LikeReviewButton({ review }: Props) {
  const { currentUser, setSignInRequired } = useContext(AuthContext);
  const [checked, setChecked] = useState(review.liked);

  const dictionary = useDictionary();

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!currentUser) {
        setSignInRequired(true);

        return;
      }

      setChecked(event.target.checked);

      const action = event.target.checked ? 'POST' : 'DELETE';

      const token = await currentUser.getIdToken();

      const headers = new Headers({
        Accept: 'application/json',
        'Accept-Language': window.navigator.language,
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${token}`
      });

      const request = new Request(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews/${review.id}/like`,
        {
          method: action,
          headers: headers
        }
      );

      try {
        const res = await fetch(request);

        if (res.ok) {
          const message = event.target.checked ? 'liked!' : 'unliked';

          enqueueSnackbar(dictionary[message], { variant: 'info' });
        } else {
          const body = await res.json();
          enqueueSnackbar(body.detail, { variant: 'error' });
        }
      } catch (error) {
        enqueueSnackbar(dictionary['an error occured'], { variant: 'error' });
      }
    },
    [currentUser, review, setSignInRequired, dictionary]
  );

  return (
    <Tooltip
      title={
        review.liked ? dictionary['button unlike'] : dictionary['button like']
      }
    >
      <Checkbox
        icon={<FavoriteBorder />}
        checkedIcon={<Favorite />}
        checked={checked}
        onChange={handleChange}
      />
    </Tooltip>
  );
});

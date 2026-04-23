import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Checkbox, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  type ChangeEvent,
  memo,
  useCallback,
  useContext,
  useState
} from 'react';
import type { Review } from '../../../types';
import { likeReview, unlikeReview } from '../../actions/reviewLikes';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  review: Review;
  onSaved?: () => void;
};

export default memo(function LikeReviewButton({ review, onSaved }: Props) {
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const [checked, setChecked] = useState(review.liked);

  const dictionary = useDictionary();

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!authenticated) {
        setSignInRequired(true);

        return;
      }

      setChecked(event.target.checked);

      try {
        const result = event.target.checked
          ? await likeReview(review.id)
          : await unlikeReview(review.id);

        if (result.success) {
          const message = event.target.checked ? 'liked!' : 'unliked';

          enqueueSnackbar(dictionary[message], { variant: 'info' });

          if (onSaved) {
            onSaved();
          }
        } else {
          enqueueSnackbar(result.error, { variant: 'error' });
        }
      } catch (error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    },
    [authenticated, review, setSignInRequired, dictionary, onSaved]
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

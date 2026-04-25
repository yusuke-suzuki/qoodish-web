import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Checkbox, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  type ChangeEvent,
  memo,
  useCallback,
  useContext,
  useState,
  useTransition
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
  const dictionary = useDictionary();

  const [checked, setChecked] = useState(review.liked);
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!authenticated) {
        setSignInRequired(true);
        return;
      }

      const next = event.target.checked;
      setChecked(next);

      startTransition(async () => {
        try {
          const result = next
            ? await likeReview(review.id)
            : await unlikeReview(review.id);

          if (result.success) {
            const message = next ? 'liked!' : 'unliked';
            enqueueSnackbar(dictionary[message], { variant: 'info' });

            if (onSaved) {
              onSaved();
            }
          } else {
            setChecked(!next);
            enqueueSnackbar(result.error, { variant: 'error' });
          }
        } catch (_error) {
          setChecked(!next);
          enqueueSnackbar(dictionary['an error occurred'], {
            variant: 'error'
          });
        }
      });
    },
    [authenticated, review, setSignInRequired, dictionary, onSaved]
  );

  return (
    <Tooltip
      title={checked ? dictionary['button unlike'] : dictionary['button like']}
    >
      <Checkbox
        icon={<FavoriteBorder />}
        checkedIcon={<Favorite />}
        checked={checked}
        disabled={isPending}
        onChange={handleChange}
      />
    </Tooltip>
  );
});

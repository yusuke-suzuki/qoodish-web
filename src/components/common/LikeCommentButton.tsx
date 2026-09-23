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
import type { Comment, Commentable } from '../../../types/index.ts';
import { likeComment, unlikeComment } from '../../actions/commentLikes.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';

type Props = {
  commentable: Commentable;
  comment: Comment;
  onSaved?: () => void;
};

export default memo(function LikeCommentButton({
  commentable,
  comment,
  onSaved
}: Props) {
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const [checked, setChecked] = useState(comment.liked);
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
            ? await likeComment(commentable, comment.id)
            : await unlikeComment(commentable, comment.id);

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
    [
      authenticated,
      commentable,
      comment,
      setSignInRequired,
      dictionary,
      onSaved
    ]
  );

  return (
    <Tooltip
      title={checked ? dictionary['button unlike'] : dictionary['button like']}
    >
      <Checkbox
        size="small"
        icon={<FavoriteBorder fontSize="small" />}
        checkedIcon={<Favorite fontSize="small" />}
        checked={checked}
        disabled={isPending}
        onChange={handleChange}
      />
    </Tooltip>
  );
});

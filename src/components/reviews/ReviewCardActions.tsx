import { Box, Button, CardActions, Stack, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useState, useTransition } from 'react';
import type { Review } from '../../../types';
import { createComment } from '../../actions/comments';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import LikeReviewButton from './LikeReviewButton';
import PosterAvatar from './PosterAvatar';

type Props = {
  review: Review;
  onCommentAdded: () => void;
};

const ReviewCardActions = ({ review, onCommentAdded }: Props) => {
  const { authenticated, setSignInRequired } = useContext(AuthContext);

  const [commentFormActive, setCommentFormActive] = useState(false);
  const [comment, setComment] = useState(undefined);
  const [isPending, startTransition] = useTransition();

  const dictionary = useDictionary();

  const handleSendClick = useCallback(() => {
    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    startTransition(async () => {
      try {
        const result = await createComment(review.id, comment);

        if (result.success) {
          enqueueSnackbar(dictionary['added comment'], { variant: 'success' });

          onCommentAdded();
        } else {
          enqueueSnackbar(result.error, { variant: 'error' });
        }
      } catch (_error) {
        enqueueSnackbar(dictionary['comment failed'], { variant: 'error' });
      } finally {
        setCommentFormActive(false);
        setComment(undefined);
      }
    });
  }, [
    authenticated,
    review,
    comment,
    onCommentAdded,
    setSignInRequired,
    dictionary
  ]);

  return (
    <CardActions sx={{ p: 2 }}>
      <Stack width="100%" spacing={1}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          gap={commentFormActive ? 0 : 1}
        >
          <Box display="flex" alignItems="center" width="100%" gap={2}>
            <PosterAvatar />

            <TextField
              fullWidth
              placeholder={dictionary['add comment']}
              onFocus={() => setCommentFormActive(true)}
              autoFocus={commentFormActive}
              multiline={commentFormActive}
              onChange={(e) => setComment(e.target.value)}
              slotProps={{
                input: {
                  disableUnderline: true
                }
              }}
            />
          </Box>

          <Box display="flex" alignItems="center">
            {!commentFormActive && <LikeReviewButton review={review} />}
          </Box>
        </Box>

        {commentFormActive && (
          <Box display="flex" justifyContent="flex-end" width="100%" gap={1}>
            <Button
              onClick={() => {
                setCommentFormActive(false);
                setComment(undefined);
              }}
              disabled={isPending}
              color="inherit"
            >
              {dictionary.cancel}
            </Button>

            <Button
              onClick={handleSendClick}
              color="secondary"
              disabled={!comment}
              loading={isPending}
              variant="contained"
            >
              {dictionary.post}
            </Button>
          </Box>
        )}
      </Stack>
    </CardActions>
  );
};

export default memo(ReviewCardActions);

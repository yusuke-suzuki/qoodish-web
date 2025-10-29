import { Box, Button, CardActions, Stack, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useState } from 'react';
import type { Review } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import LikeReviewButton from './LikeReviewButton';
import PosterAvatar from './PosterAvatar';

type Props = {
  review: Review;
  onCommentAdded: () => void;
};

const ReviewCardActions = ({ review, onCommentAdded }: Props) => {
  const { currentUser, setSignInRequired } = useContext(AuthContext);

  const [commentFormActive, setCommentFormActive] = useState(false);
  const [comment, setComment] = useState(undefined);
  const [sending, setSending] = useState(false);

  const dictionary = useDictionary();

  const handleSendClick = useCallback(async () => {
    if (!currentUser) {
      setSignInRequired(true);
      return;
    }

    setSending(true);

    const params = {
      comment: comment
    };

    const token = await currentUser.getIdToken();

    const headers = new Headers({
      Accept: 'application/json',
      'Accept-Language': window.navigator.language,
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`
    });

    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews/${review.id}/comments`,
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(params)
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        enqueueSnackbar(dictionary['added comment'], { variant: 'success' });

        onCommentAdded();
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['comment failed'], { variant: 'error' });
    } finally {
      setCommentFormActive(false);
      setComment(undefined);
      setSending(false);
    }
  }, [
    currentUser,
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
              InputProps={{
                disableUnderline: true
              }}
              onFocus={() => setCommentFormActive(true)}
              autoFocus={commentFormActive}
              multiline={commentFormActive}
              onChange={(e) => setComment(e.target.value)}
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
              disabled={sending}
              color="inherit"
            >
              {dictionary.cancel}
            </Button>

            <Button
              onClick={handleSendClick}
              color="secondary"
              disabled={!comment}
              loading={sending}
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

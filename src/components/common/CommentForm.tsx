import { Box, Button, Stack, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useState,
  useTransition
} from 'react';
import type { Commentable } from '../../../types/index.ts';
import { createComment } from '../../actions/comments.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import PosterAvatar from './PosterAvatar.tsx';

type Props = {
  commentable: Commentable;
  onCommentAdded: () => void;
  collapsedAction?: ReactNode;
};

const CommentForm = ({
  commentable,
  onCommentAdded,
  collapsedAction
}: Props) => {
  const { authenticated, setSignInRequired } = useContext(AuthContext);

  const [active, setActive] = useState(false);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const dictionary = useDictionary();

  const handleSendClick = useCallback(() => {
    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    startTransition(async () => {
      try {
        const result = await createComment(commentable, comment);

        if (result.success) {
          enqueueSnackbar(dictionary['added comment'], { variant: 'success' });

          onCommentAdded();
        } else {
          enqueueSnackbar(result.error, { variant: 'error' });
        }
      } catch (_error) {
        enqueueSnackbar(dictionary['comment failed'], { variant: 'error' });
      } finally {
        setActive(false);
        setComment('');
      }
    });
  }, [
    authenticated,
    commentable,
    comment,
    onCommentAdded,
    setSignInRequired,
    dictionary
  ]);

  return (
    <Stack width="100%" spacing={1}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        gap={active ? 0 : 1}
      >
        <Box display="flex" alignItems="center" width="100%" gap={2}>
          <PosterAvatar />

          <TextField
            fullWidth
            value={comment}
            placeholder={dictionary['add comment']}
            onFocus={() => setActive(true)}
            autoFocus={active}
            multiline={active}
            onChange={(e) => setComment(e.target.value)}
            slotProps={{
              input: {
                disableUnderline: true
              }
            }}
          />
        </Box>

        {collapsedAction && (
          <Box display="flex" alignItems="center">
            {!active && collapsedAction}
          </Box>
        )}
      </Box>

      {active && (
        <Box display="flex" justifyContent="flex-end" width="100%" gap={1}>
          <Button
            onClick={() => {
              setActive(false);
              setComment('');
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
  );
};

export default memo(CommentForm);

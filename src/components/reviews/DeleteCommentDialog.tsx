import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useActionState } from 'react';
import type { Comment } from '../../../types';
import { deleteComment } from '../../actions/comments';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  comment: Comment | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const DeleteCommentDialog = ({ comment, open, onClose, onDeleted }: Props) => {
  const dictionary = useDictionary();

  const [, submitAction, isPending] = useActionState<null, FormData>(
    async (_prevState, _formData) => {
      if (!comment) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return null;
      }

      try {
        const result = await deleteComment(comment.review_id, comment.id);

        if (result.success) {
          enqueueSnackbar(dictionary['delete comment success'], {
            variant: 'success'
          });

          onClose();
          onDeleted();
          return null;
        }

        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });
        return null;
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return null;
      }
    },
    null
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <form action={submitAction}>
        <DialogTitle>{dictionary['delete comment']}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dictionary['sure to delete comment']}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={onClose}
            disabled={isPending}
            color="inherit"
          >
            {dictionary.cancel}
          </Button>
          <Button type="submit" color="error" loading={isPending}>
            {dictionary.delete}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default memo(DeleteCommentDialog);

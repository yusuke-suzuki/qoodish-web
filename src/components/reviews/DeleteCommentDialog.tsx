import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useState } from 'react';
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

  const [loading, setLoading] = useState(false);

  const handleDeleteButtonClick = useCallback(async () => {
    setLoading(true);

    try {
      const result = await deleteComment(comment?.review_id, comment?.id);

      if (result.success) {
        enqueueSnackbar(dictionary['delete comment success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
      } else {
        enqueueSnackbar(result.error, { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [comment, onClose, onDeleted, dictionary]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{dictionary['delete comment']}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {dictionary['sure to delete comment']}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {dictionary.cancel}
        </Button>
        <Button
          onClick={handleDeleteButtonClick}
          color="error"
          loading={loading}
        >
          {dictionary.delete}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(DeleteCommentDialog);

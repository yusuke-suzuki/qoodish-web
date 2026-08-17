import { enqueueSnackbar } from 'notistack';
import { memo, useCallback } from 'react';
import type { Comment } from '../../../types';
import { deleteComment } from '../../actions/comments';
import useDictionary from '../../hooks/useDictionary';
import ConfirmDialog from '../common/ConfirmDialog';

type Props = {
  comment: Comment | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const DeleteCommentDialog = ({ comment, open, onClose, onDeleted }: Props) => {
  const dictionary = useDictionary();

  const handleConfirm = useCallback(async () => {
    if (!comment) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      return;
    }

    try {
      const result = await deleteComment(comment.review_id, comment.id);

      if (result.success) {
        enqueueSnackbar(dictionary['delete comment success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
        return;
      }

      enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
        variant: 'error'
      });
    } catch (_error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    }
  }, [comment, dictionary, onClose, onDeleted]);

  return (
    <ConfirmDialog
      open={open}
      title={dictionary['delete comment']}
      description={dictionary['sure to delete comment']}
      confirmLabel={dictionary.delete}
      confirmColor="error"
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
};

export default memo(DeleteCommentDialog);

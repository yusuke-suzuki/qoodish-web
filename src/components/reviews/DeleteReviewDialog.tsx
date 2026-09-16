import { enqueueSnackbar } from 'notistack';
import { memo, useCallback } from 'react';
import type { Review } from '../../../types/index.ts';
import { deleteReview } from '../../actions/reviews.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog.tsx';

type Props = {
  review: Review | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const DeleteReviewDialog = ({ review, open, onClose, onDeleted }: Props) => {
  const dictionary = useDictionary();

  const handleConfirm = useCallback(async () => {
    if (!review) {
      enqueueSnackbar(dictionary['delete pin failed'], { variant: 'error' });
      return;
    }

    try {
      const result = await deleteReview(
        review.id,
        review.map.id,
        review.author.id
      );

      if (result.success) {
        enqueueSnackbar(dictionary['delete pin success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
        return;
      }

      enqueueSnackbar(result.error ?? dictionary['delete pin failed'], {
        variant: 'error'
      });
    } catch (_error) {
      enqueueSnackbar(dictionary['delete pin failed'], { variant: 'error' });
    }
  }, [review, dictionary, onClose, onDeleted]);

  return (
    <ConfirmDeleteDialog
      open={open}
      title={dictionary['sure to delete pin']}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
};

export default memo(DeleteReviewDialog);

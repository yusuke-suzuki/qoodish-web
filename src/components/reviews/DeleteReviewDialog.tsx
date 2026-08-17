import { enqueueSnackbar } from 'notistack';
import { memo, useCallback } from 'react';
import type { Review } from '../../../types';
import { deleteReview } from '../../actions/reviews';
import useDictionary from '../../hooks/useDictionary';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog';

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
      enqueueSnackbar(dictionary['delete report failed'], { variant: 'error' });
      return;
    }

    try {
      const result = await deleteReview(review.id);

      if (result.success) {
        enqueueSnackbar(dictionary['delete report success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
        return;
      }

      enqueueSnackbar(result.error ?? dictionary['delete report failed'], {
        variant: 'error'
      });
    } catch (_error) {
      enqueueSnackbar(dictionary['delete report failed'], { variant: 'error' });
    }
  }, [review, dictionary, onClose, onDeleted]);

  return (
    <ConfirmDeleteDialog
      open={open}
      title={dictionary['sure to delete report']}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
};

export default memo(DeleteReviewDialog);

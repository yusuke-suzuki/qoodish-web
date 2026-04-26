import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useActionState, useState } from 'react';
import type { Review } from '../../../types';
import { deleteReview } from '../../actions/reviews';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  review: Review | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const DeleteReviewDialog = ({ review, open, onClose, onDeleted }: Props) => {
  const dictionary = useDictionary();

  const [check, setCheck] = useState(false);

  const [, submitAction, isPending] = useActionState<null, FormData>(
    async (_prevState, _formData) => {
      if (!review) {
        enqueueSnackbar(dictionary['delete report failed'], {
          variant: 'error'
        });
        return null;
      }

      try {
        const result = await deleteReview(review.id);

        if (result.success) {
          enqueueSnackbar(dictionary['delete report success'], {
            variant: 'success'
          });

          onClose();
          onDeleted();
          return null;
        }

        enqueueSnackbar(result.error ?? dictionary['delete report failed'], {
          variant: 'error'
        });
        return null;
      } catch (_error) {
        enqueueSnackbar(dictionary['delete report failed'], {
          variant: 'error'
        });
        return null;
      }
    },
    null
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      slotProps={{
        transition: {
          onExited: () => setCheck(false)
        }
      }}
    >
      <form action={submitAction}>
        <DialogTitle>{dictionary['sure to delete report']}</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            {dictionary['this cannot be undone']}
          </DialogContentText>

          <FormControlLabel
            control={
              <Checkbox
                checked={check}
                onChange={() => setCheck((prev) => !prev)}
                color="success"
              />
            }
            label={dictionary['understand this cannot be undone']}
          />
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={onClose}
            color="inherit"
            disabled={isPending}
          >
            {dictionary.cancel}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={!check}
            loading={isPending}
          >
            {dictionary.delete}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default memo(DeleteReviewDialog);

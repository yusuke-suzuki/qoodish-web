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
import { memo, useCallback, useState } from 'react';
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
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCheckChange = useCallback(() => {
    setCheck(!check);
    setDisabled(!disabled);
  }, [check, disabled]);

  const handleExited = useCallback(() => {
    setCheck(false);
    setDisabled(true);
  }, []);

  const handleDeleteButtonClick = useCallback(async () => {
    setLoading(true);

    try {
      const result = await deleteReview(review?.id);

      if (result.success) {
        enqueueSnackbar(dictionary['delete report success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
      } else {
        enqueueSnackbar(result.error, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['delete report failed'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [review, onClose, onDeleted, dictionary]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      slotProps={{
        transition: {
          onExited: handleExited
        }
      }}
    >
      <DialogTitle>{dictionary['sure to delete report']}</DialogTitle>
      <DialogContent>
        <DialogContentText gutterBottom>
          {dictionary['this cannot be undone']}
        </DialogContentText>

        <FormControlLabel
          control={
            <Checkbox
              checked={check}
              onChange={handleCheckChange}
              color="success"
            />
          }
          label={dictionary['understand this cannot be undone']}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          {dictionary.cancel}
        </Button>
        <Button
          variant="contained"
          onClick={handleDeleteButtonClick}
          color="error"
          disabled={disabled}
          loading={loading}
        >
          {dictionary.delete}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(DeleteReviewDialog);

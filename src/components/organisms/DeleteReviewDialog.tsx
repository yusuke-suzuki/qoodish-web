import React, { useState, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import I18n from '../../utils/I18n';

import deleteReview from '../../actions/deleteReview';
import closeDeleteReviewDialog from '../../actions/closeDeleteReviewDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import { ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import closeReviewDialog from '../../actions/closeReviewDialog';

const DeleteReviewDialog = () => {
  const mapState = useCallback(
    state => ({
      review: state.reviews.targetReview,
      dialogOpen: state.reviews.deleteReviewDialogOpen,
      reviewDialogOpen: state.reviews.reviewDialogOpen
    }),
    []
  );
  const { review, dialogOpen, reviewDialogOpen } = useMappedState(mapState);
  const dispatch = useDispatch();

  const [check, setCheck] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const handleCheckChange = useCallback(() => {
    setCheck(!check);
    setDisabled(!disabled);
  }, [check, disabled]);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeDeleteReviewDialog());
  }, [dispatch]);

  const handleExited = useCallback(() => {
    setCheck(false);
    setDisabled(true);
  }, []);

  const handleDeleteButtonClick = useCallback(async () => {
    dispatch(requestStart());

    const apiInstance = new ReviewsApi();

    apiInstance.reviewsReviewIdDelete(review.id, (error, data, response) => {
      dispatch(requestFinish());

      if (response.ok) {
        dispatch(closeDeleteReviewDialog());

        if (reviewDialogOpen) {
          dispatch(closeReviewDialog());
        }
        dispatch(deleteReview(review.id));
        dispatch(openToast(I18n.t('delete report success')));
      } else {
        dispatch(openToast(I18n.t('delete report failed')));
      }
    });
  }, [dispatch, reviewDialogOpen, review]);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestDialogClose}
      onExited={handleExited}
      fullWidth
    >
      <DialogTitle>{I18n.t('sure to delete report')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{I18n.t('this cannot be undone')}</DialogContentText>
        <br />
        <FormControlLabel
          control={<Checkbox checked={check} onChange={handleCheckChange} />}
          label={I18n.t('understand this cannot be undone')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRequestDialogClose}>{I18n.t('cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleDeleteButtonClick}
          color="primary"
          disabled={disabled}
        >
          {I18n.t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DeleteReviewDialog);

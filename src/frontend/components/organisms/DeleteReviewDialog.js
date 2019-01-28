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

import ApiClient from '../../utils/ApiClient';
import deleteReview from '../../actions/deleteReview';
import closeDeleteReviewDialog from '../../actions/closeDeleteReviewDialog';
import closeReviewDialog from '../../actions/closeReviewDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import fetchSpots from '../../actions/fetchSpots';
import deleteFromStorage from '../../utils/deleteFromStorage';

const DeleteReviewDialog = props => {
  const mapState = useCallback(
    state => ({
      review: state.reviews.targetReview,
      dialogOpen: state.reviews.deleteReviewDialogOpen,
      history: state.shared.history
    }),
    []
  );
  const { review, dialogOpen, history } = useMappedState(mapState);
  const dispatch = useDispatch();

  const [check, setCheck] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const handleCheckChange = useCallback(() => {
    setCheck(!check);
    setDisabled(!disabled);
  });

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeDeleteReviewDialog());
    setCheck(false);
    setDisabled(true);
  });

  const handleDeleteButtonClick = useCallback(async () => {
    dispatch(requestStart());
    const client = new ApiClient();
    const response = await client.deleteReview(review.id);
    dispatch(requestFinish());
    if (response.ok) {
      if (review.image) {
        deleteFromStorage(review.image.file_name);
      }
      dispatch(closeReviewDialog());
      dispatch(closeDeleteReviewDialog());
      if (props.mapId) {
        let spotResponse = await client.fetchSpots(review.map.id);
        if (spotResponse.ok) {
          let spots = await spotResponse.json();
          dispatch(fetchSpots(spots));
        }
        history.push(`/maps/${review.map.id}`);
      }
      dispatch(deleteReview(review.id));
      dispatch(openToast(I18n.t('delete report success')));
    } else {
      let json = await response.json();
      dispatch(openToast(json.detail));
    }
  });

  return (
    <Dialog open={dialogOpen} onClose={handleRequestDialogClose} fullWidth>
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

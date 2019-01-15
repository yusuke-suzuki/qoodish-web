import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import I18n from '../../utils/I18n';

import ApiClient from '../../utils/ApiClient';
import editReview from '../../actions/editReview';
import closeDeleteCommentDialog from '../../actions/closeDeleteCommentDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

const DeleteCommentDialog = () => {
  const mapState = useCallback(
    state => ({
      comment: state.reviews.targetComment,
      dialogOpen: state.reviews.deleteCommentDialogOpen
    }),
    []
  );
  const { comment, dialogOpen } = useMappedState(mapState);
  const dispatch = useDispatch();

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeDeleteCommentDialog());
  });

  const handleDeleteButtonClick = useCallback(async () => {
    dispatch(requestStart());
    const client = new ApiClient();
    let response = await client.deleteComment(comment.review_id, comment.id);
    dispatch(requestFinish());

    if (response.ok) {
      dispatch(closeDeleteCommentDialog());
      dispatch(openToast(I18n.t('deleted comment')));
      let review = await response.json();
      dispatch(editReview(review));
    } else {
      dispatch(openToast(I18n.t('delete comment failed')));
    }
  });

  return (
    <Dialog open={dialogOpen} onClose={handleRequestDialogClose}>
      <DialogTitle>{I18n.t('delete comment')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {I18n.t('sure to delete comment')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRequestDialogClose}>{I18n.t('cancel')}</Button>
        <Button onClick={handleDeleteButtonClick} color="primary">
          {I18n.t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DeleteCommentDialog);

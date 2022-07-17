import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import editReview from '../../actions/editReview';
import closeDeleteCommentDialog from '../../actions/closeDeleteCommentDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import { CommentsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import { useLocale } from '../../hooks/useLocale';

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
  const { I18n } = useLocale();

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeDeleteCommentDialog());
  }, [dispatch]);

  const handleDeleteButtonClick = useCallback(async () => {
    dispatch(requestStart());
    const apiInstance = new CommentsApi();

    apiInstance.reviewsReviewIdCommentsCommentIdDelete(
      comment.review_id,
      comment.id,
      (error, data, response) => {
        dispatch(requestFinish());

        if (response.ok) {
          dispatch(closeDeleteCommentDialog());
          dispatch(openToast(I18n.t('deleted comment')));
          dispatch(editReview(response.body));
        } else {
          dispatch(openToast(I18n.t('delete comment failed')));
        }
      }
    );
  }, [dispatch, comment]);

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

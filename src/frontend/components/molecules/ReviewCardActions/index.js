import React from 'react';
import { connect } from 'react-redux';
import ReviewCardActions from './ReviewCardActions';
import ApiClient from '../../../utils/ApiClient';
import sendCommentStart from '../../../actions/sendCommentStart';
import sendCommentEnd from '../../../actions/sendCommentEnd';
import editReview from '../../../actions/editReview';
import openToast from '../../../actions/openToast';
import openSignInRequiredDialog from '../../../actions/openSignInRequiredDialog';
import I18n from '../../../utils/I18n';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    sendingComment: state.reviews.sendingComment
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleSendCommentButtonClick: async (params, currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }

      dispatch(sendCommentStart());
      const client = new ApiClient();
      let response = await client.sendComment(
        ownProps.review.id,
        params.comment
      );
      if (response.ok) {
        dispatch(openToast(I18n.t('added comment')));
        let review = await response.json();
        dispatch(editReview(review));
      } else {
        dispatch(openToast(I18n.t('comment failed')));
      }
      dispatch(sendCommentEnd());
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ReviewCardActions)
);

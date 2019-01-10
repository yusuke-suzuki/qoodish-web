import React from 'react';
import { connect } from 'react-redux';
import ReviewVertMenu from '../ui/ReviewVertMenu';
import openEditReviewDialog from '../actions/openEditReviewDialog';
import openCopyReviewDialog from '../actions/openCopyReviewDialog';
import openDeleteReviewDialog from '../actions/openDeleteReviewDialog';
import openIssueDialog from '../actions/openIssueDialog';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleEditReviewButtonClick: review => {
      dispatch(openEditReviewDialog(review));
    },

    handleCopyReviewButtonClick: review => {
      dispatch(openCopyReviewDialog(review));
    },

    handleDeleteReviewButtonClick: review => {
      dispatch(openDeleteReviewDialog(review));
    },

    handleIssueButtonClick: (currentUser, review) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(openIssueDialog(review.id, 'review'));
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ReviewVertMenu)
);

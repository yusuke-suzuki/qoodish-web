import React from 'react';
import { connect } from 'react-redux';
import ReviewDialog from '../ui/ReviewDialog';
import closeReviewDialog from '../actions/closeReviewDialog';

const mapStateToProps = state => {
  return {
    dialogOpen: state.reviews.reviewDialogOpen,
    currentReview: state.reviews.currentReview,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeReviewDialog());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(ReviewDialog));

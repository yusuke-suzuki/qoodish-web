import React from 'react';
import { connect } from 'react-redux';
import RecentReviews from '../ui/RecentReviews';
import openReviewDialog from '../actions/openReviewDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    recentReviews: state.discover.recentReviews,
    loading: state.discover.loadingRecentReviews
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleReviewClick: review => {
      dispatch(openReviewDialog(review));
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(RecentReviews)
);

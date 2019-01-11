import React from 'react';
import { connect } from 'react-redux';
import ReviewDetail from './ReviewDetail';
import ApiClient from '../../../utils/ApiClient';
import openToast from '../../../actions/openToast';
import selectReview from '../../../actions/selectReview';
import loadReviewStart from '../../../actions/loadReviewStart';
import loadReviewEnd from '../../../actions/loadReviewEnd';
import clearReviewState from '../../../actions/clearReviewState';

const mapStateToProps = state => {
  return {
    currentReview: state.reviewDetail.currentReview,
    reviewLoading: state.reviewDetail.reviewLoading,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchReview: async () => {
      dispatch(loadReviewStart());
      const client = new ApiClient();
      let response = await client.fetchReview(
        ownProps.match.params.mapId,
        ownProps.match.params.reviewId
      );
      let json = await response.json();
      dispatch(loadReviewEnd());
      if (response.ok) {
        dispatch(selectReview(json));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else if (response.status == 404) {
        dispatch(openToast('Report not found.'));
      } else {
        dispatch(openToast('Failed to fetch Report.'));
      }
    },

    clear: () => {
      dispatch(clearReviewState());
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ReviewDetail)
);

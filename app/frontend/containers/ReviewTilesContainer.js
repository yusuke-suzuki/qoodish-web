import React from 'react';
import { connect } from 'react-redux';
import ReviewTiles from '../ui/ReviewTiles';
import openReviewDialog from '../actions/openReviewDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleReviewClick: review => {
      dispatch(openReviewDialog(review));
    }
  }
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(ReviewTiles));
import { connect } from 'react-redux';
import ReviewsDialog from '../ui/ReviewsDialog';
import closeReviewsDialog from '../actions/closeReviewsDialog';
import openReviewDialog from '../actions/openReviewDialog';
import selectReview from '../actions/selectReview';
import { push } from 'react-router-redux';

const mapStateToProps = state => {
  return {
    dialogOpen: state.mapDetail.reviewsDialogOpen,
    reviews: state.mapDetail.spotReviews,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeReviewsDialog());
    },

    handleReviewClick: (review, large) => {
      if (large) {
        dispatch(openReviewDialog(review));
      } else {
        dispatch(selectReview(review));
        dispatch(push(`/maps/${review.map_id}/reports/${review.id}`, {
          previous: true
        }));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReviewsDialog);

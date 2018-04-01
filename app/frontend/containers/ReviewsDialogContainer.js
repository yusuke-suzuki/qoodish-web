import { connect } from 'react-redux';
import ReviewsDialog from '../ui/ReviewsDialog';
import closeReviewsDialog from '../actions/closeReviewsDialog';
import openReviewDialog from '../actions/openReviewDialog';

const mapStateToProps = state => {
  return {
    dialogOpen: state.mapDetail.reviewsDialogOpen,
    reviews: state.mapDetail.spotReviews
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeReviewsDialog());
    },

    handleReviewClick: (review) => {
      dispatch(openReviewDialog(review));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReviewsDialog);

import { connect } from 'react-redux';
import ReviewsDialog from '../ui/ReviewsDialog';
import closeReviewsDialog from '../actions/closeReviewsDialog';
import openReviewDialog from '../actions/openReviewDialog';
import selectPlaceForReview from '../actions/selectPlaceForReview';

const mapStateToProps = state => {
  return {
    dialogOpen: state.mapDetail.reviewsDialogOpen,
    reviews: state.mapDetail.spotReviews,
    currentMap: state.mapDetail.currentMap,
    currentSpot: state.spotCard.currentSpot,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeReviewsDialog());
    },

    handleReviewClick: (review) => {
      dispatch(openReviewDialog(review));
    },

    handleAddReviewButtonClick: spot => {
      let place = {
        description: spot.name,
        placeId: spot.place_id
      };
      dispatch(selectPlaceForReview(place));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReviewsDialog);

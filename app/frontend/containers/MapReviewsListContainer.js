import { connect } from 'react-redux';
import MapReviewsList from '../ui/MapReviewsList';
import requestMapCenter from '../actions/requestMapCenter';
import openReviewDialog from '../actions/openReviewDialog';
import selectSpot from '../actions/selectSpot';

const mapStateToProps = state => {
  return {
    mapReviews: state.mapSummary.mapReviews,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleReviewClick: (review) => {
      dispatch(selectSpot(review.spot));
      dispatch(requestMapCenter(review.spot.lat, review.spot.lng));
      dispatch(openReviewDialog(review));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapReviewsList);

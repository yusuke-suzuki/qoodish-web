import { connect } from 'react-redux';
import MapSummaryCard from '../ui/MapSummaryCard';
import requestMapCenter from '../actions/requestMapCenter';
import openReviewDialog from '../actions/openReviewDialog';
import selectSpot from '../actions/selectSpot';

const mapStateToProps = state => {
  return {
    map: state.mapSummary.currentMap,
    mapReviews: state.mapSummary.mapReviews,
    followers: state.mapSummary.followers,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleBaseClick: (map) => {
      dispatch(requestMapCenter(map.base.lat, map.base.lng));
    },

    handleReviewClick: (review) => {
      dispatch(selectSpot(review.spot));
      dispatch(requestMapCenter(review.spot.lat, review.spot.lng));
      dispatch(openReviewDialog(review));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapSummaryCard);

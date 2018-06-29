import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import MapSummary from '../ui/MapSummary';
import requestMapCenter from '../actions/requestMapCenter';
import openJoinMapDialog from '../actions/openJoinMapDialog';
import openLeaveMapDialog from '../actions/openLeaveMapDialog';
import openReviewDialog from '../actions/openReviewDialog';
import openSpotCard from '../actions/openSpotCard';
import selectSpot from '../actions/selectSpot';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    currentMap: state.mapSummary.currentMap,
    collaborators: state.mapSummary.collaborators,
    spots: state.gMap.spots,
    mapReviews: state.mapSummary.mapReviews,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleSpotClick: async (spot) => {
      dispatch(requestMapCenter(spot.lat, spot.lng));
      dispatch(selectSpot(spot));
      dispatch(openSpotCard());
    },

    handleReviewClick: async (review) => {
      dispatch(selectSpot(review.spot));
      dispatch(requestMapCenter(review.spot.lat, review.spot.lng));
      dispatch(openReviewDialog(review));
    },

    handleUserClick: userId => {
      dispatch(push(`/users/${userId}`, {
        previous: true
      }));
    },

    handleJoinButtonClick: () => {
      dispatch(openJoinMapDialog());
    },

    handleLeaveButtonClick: () => {
      dispatch(openLeaveMapDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapSummary);

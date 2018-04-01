import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import ApiClient from './ApiClient';
import MapSummary from '../ui/MapSummary';
import requestMapCenter from '../actions/requestMapCenter';
import openEditMapDialog from '../actions/openEditMapDialog';
import openDeleteMapDialog from '../actions/openDeleteMapDialog';
import openJoinMapDialog from '../actions/openJoinMapDialog';
import openLeaveMapDialog from '../actions/openLeaveMapDialog';
import openToast from '../actions/openToast';
import openIssueDialog from '../actions/openIssueDialog';
import openReviewDialog from '../actions/openReviewDialog';
import openSpotCard from '../actions/openSpotCard';
import selectSpot from '../actions/selectSpot';
import openInviteTargetDialog from '../actions/openInviteTargetDialog';

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

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleSpotClick: async (spot, large) => {
      if (!large) {
        dispatch(push(`/maps/${ownProps.mapId}#map`, {
          previous: true
        }));
      }
      dispatch(requestMapCenter(spot.lat, spot.lng));
      dispatch(selectSpot(spot));
      dispatch(openSpotCard());
    },

    handleReviewClick: async (review, large) => {
      dispatch(selectSpot(review.spot));
      dispatch(requestMapCenter(review.spot.lat, review.spot.lng));
      dispatch(openReviewDialog(review));
    },

    handleJoinButtonClick: () => {
      dispatch(openJoinMapDialog());
    },

    handleLeaveButtonClick: () => {
      dispatch(openLeaveMapDialog());
    },

    handleTweetButtonClick: map => {
      let url = `${process.env.ENDPOINT}/maps/${map.id}`;
      window.open(`https://twitter.com/intent/tweet?text=${map.name}&url=${url}`);
    },

    handleFacebookButtonClick: map => {
      let url = `${process.env.ENDPOINT}/maps/${map.id}`;
      window.open(
        `https://www.facebook.com/dialog/share?app_id=${
          process.env.FB_APP_ID
        }&href=${url}`
      );
    },

    handleUrlCopied: () => {
      dispatch(openToast('Copied!'));
    },

    handleEditMapButtonClick: map => {
      dispatch(openEditMapDialog(map));
    },

    handleDeleteMapButtonClick: map => {
      dispatch(openDeleteMapDialog(map));
    },

    handleIssueButtonClick: map => {
      dispatch(openIssueDialog(map.id, 'map'));
    },

    handleInviteButtonClick: () => {
      dispatch(openInviteTargetDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapSummary);

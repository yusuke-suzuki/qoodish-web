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
import closeMapSummary from '../actions/closeMapSummary';
import openReviewDialog from '../actions/openReviewDialog';
import fetchSpotReviews from '../actions/fetchSpotReviews';
import openSpotDetail from '../actions/openSpotDetail';
import closeSpotDetail from '../actions/closeSpotDetail';
import selectSpot from '../actions/selectSpot';

const mapStateToProps = (state) => {
  return {
    currentUser: state.app.currentUser,
    currentMap: state.mapSummary.currentMap,
    drawerOpen: state.mapSummary.mapSummaryOpen,
    collaborators: state.mapSummary.collaborators,
    spots: state.gMap.spots,
    mapReviews: state.mapSummary.mapReviews,
    large: state.shared.large
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleSpotClick: async (spot) => {
      dispatch(requestMapCenter(spot.lat, spot.lng));
      dispatch(selectSpot(spot));
      dispatch(openSpotDetail(spot));
      const client = new ApiClient;
      let response = await client.fetchSpotReviews(ownProps.mapId, spot.place_id);
      if (response.ok) {
        let reviews = await response.json();
        dispatch(fetchSpotReviews(reviews));
      }
    },

    handleReviewClick: async (review) => {
      dispatch(selectSpot(review.spot));
      dispatch(requestMapCenter(review.spot.lat, review.spot.lng));
      dispatch(openReviewDialog(review));
      dispatch(push(`/maps/${review.map_id}/reports/${review.id}`));
      const client = new ApiClient;
      let response = await client.fetchSpotReviews(ownProps.mapId, review.spot.place_id);
      if (response.ok) {
        let reviews = await response.json();
        dispatch(fetchSpotReviews(reviews));
      }
    },

    handleJoinButtonClick: () => {
      dispatch(openJoinMapDialog());
    },

    handleLeaveButtonClick: () => {
      dispatch(openLeaveMapDialog());
    },

    handleTweetButtonClick: (map) => {
      let url = `${process.env.ENDPOINT}/maps/${map.id}`;
      let text = `「${map.name}」に参加しています。`;
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
    },

    handleFacebookButtonClick: (map) => {
      let url = `${process.env.ENDPOINT}/maps/${map.id}`;
      window.open(`https://www.facebook.com/dialog/share?app_id=${process.env.FB_APP_ID}&href=${url}`);
    },

    handleUrlCopied: () => {
      dispatch(openToast('Copied!'));
    },

    handleEditMapButtonClick: (map) => {
      dispatch(openEditMapDialog(map));
    },

    handleDeleteMapButtonClick: (map) => {
      dispatch(openDeleteMapDialog(map));
    },

    handleIssueButtonClick: (map) => {
      dispatch(openIssueDialog(map.id, 'map'))
    },

    handleCloseButtonClick: () => {
      dispatch(closeMapSummary());
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapSummary);

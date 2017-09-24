import { connect } from 'react-redux';
import MapSummary from '../ui/MapSummary';
import requestMapCenter from '../actions/requestMapCenter';
import openEditMapDialog from '../actions/openEditMapDialog';
import openDeleteMapDialog from '../actions/openDeleteMapDialog';
import openJoinMapDialog from '../actions/openJoinMapDialog';
import openLeaveMapDialog from '../actions/openLeaveMapDialog';
import openToast from '../actions/openToast';
import openIssueDialog from '../actions/openIssueDialog';

const mapStateToProps = (state) => {
  return {
    currentUser: state.app.currentUser,
    currentMap: state.mapDetail.currentMap,
    drawerOpen: state.mapDetail.mapSummaryOpen,
    collaborators: state.mapDetail.collaborators,
    spots: state.gMap.spots
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    requestSpotPosition: (spot) => {
      dispatch(requestMapCenter(spot.lat, spot.lng));
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
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapSummary);

import { connect } from 'react-redux';
import MapToolbar from '../ui/MapToolbar';
import openEditMapDialog from '../actions/openEditMapDialog';
import openDeleteMapDialog from '../actions/openDeleteMapDialog';
import openToast from '../actions/openToast';
import openIssueDialog from '../actions/openIssueDialog';
import openInviteTargetDialog from '../actions/openInviteTargetDialog';
import switchMap from '../actions/switchMap';

const mapStateToProps = state => {
  return {
    currentMap: state.mapSummary.currentMap
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
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
    },

    handleRequestClose: () => {
      dispatch(switchMap());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapToolbar);

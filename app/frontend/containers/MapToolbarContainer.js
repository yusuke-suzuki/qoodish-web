import React from 'react';
import { connect } from 'react-redux';
import MapToolbar from '../ui/MapToolbar';
import openEditMapDialog from '../actions/openEditMapDialog';
import openDeleteMapDialog from '../actions/openDeleteMapDialog';
import openToast from '../actions/openToast';
import openIssueDialog from '../actions/openIssueDialog';
import openInviteTargetDialog from '../actions/openInviteTargetDialog';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';

const mapStateToProps = state => {
  return {
    currentMap: state.mapSummary.currentMap,
    currentUser: state.app.currentUser,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleUrlCopied: () => {
      dispatch(openToast('Copied!'));
    },

    handleEditMapButtonClick: map => {
      dispatch(openEditMapDialog(map));
    },

    handleDeleteMapButtonClick: map => {
      dispatch(openDeleteMapDialog(map));
    },

    handleIssueButtonClick: (currentUser, map) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(openIssueDialog(map.id, 'map'));
    },

    handleInviteButtonClick: () => {
      dispatch(openInviteTargetDialog());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(MapToolbar));

import React from 'react';
import { connect } from 'react-redux';
import MapVertMenu from '../ui/MapVertMenu';
import openEditMapDialog from '../actions/openEditMapDialog';
import openDeleteMapDialog from '../actions/openDeleteMapDialog';
import openIssueDialog from '../actions/openIssueDialog';
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
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(MapVertMenu));

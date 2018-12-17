import React from 'react';
import { connect } from 'react-redux';
import LeaveMapDialog from '../ui/LeaveMapDialog';
import ApiClient from './ApiClient';
import leaveMap from '../actions/leaveMap';
import closeLeaveMapDialog from '../actions/closeLeaveMapDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import fetchCollaborators from '../actions/fetchCollaborators';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    dialogOpen: state.maps.leaveMapDialogOpen,
    currentMap: state.maps.targetMap
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleCancelButtonClick: () => {
      dispatch(closeLeaveMapDialog());
    },

    handleRequestDialogClose: () => {
      dispatch(closeLeaveMapDialog());
    },

    handleLeaveButtonClick: async (currentMap) => {
      dispatch(requestStart());
      const client = new ApiClient();
      let response = await client.unfollowMap(currentMap.id);
      dispatch(requestFinish());
      if (response.ok) {
        let map = await response.json();
        dispatch(leaveMap(map));
        dispatch(openToast(I18n.t('unfollow map success')));

        gtag('event', 'unfollow', {
          'event_category': 'engagement',
          'event_label': 'map'
        });

        let colloboratorsResponse = await client.fetchCollaborators(map.id);
        let collaborators = await colloboratorsResponse.json();
        dispatch(fetchCollaborators(collaborators));
      } else {
        dispatch(openToast('Failed to unfollow map'));
      }
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(LeaveMapDialog));

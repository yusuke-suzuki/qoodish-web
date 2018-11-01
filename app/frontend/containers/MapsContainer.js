import React from 'react';
import { connect } from 'react-redux';
import Maps from '../ui/Maps';
import ApiClient from '../containers/ApiClient';

import fetchMyMaps from '../actions/fetchMyMaps';
import fetchFollowingMaps from '../actions/fetchFollowingMaps';
import loadMyMapsStart from '../actions/loadMyMapsStart';
import loadMyMapsEnd from '../actions/loadMyMapsEnd';
import loadFollowingMapsStart from '../actions/loadFollowingMapsStart';
import loadFollowingMapsEnd from '../actions/loadFollowingMapsEnd';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import updatePageTitle from '../actions/updatePageTitle';
import showMapsTab from '../actions/showMapsTab';
import hideMapsTab from '../actions/hideMapsTab';
import switchMyMaps from '../actions/switchMyMaps';
import switchFollowingMaps from '../actions/switchFollowingMaps';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    myMaps: state.maps.myMaps,
    followingMaps: state.maps.followingMaps,
    loadingMyMaps: state.maps.loadingMyMaps,
    loadingFollowingMaps: state.maps.loadingFollowingMaps,
    large: state.shared.large,
    tabValue: state.maps.tabValue
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle(I18n.t('maps')));
    },

    showTabs: () => {
      dispatch(showMapsTab());
    },

    hideTabs: () => {
      dispatch(hideMapsTab());
    },

    handleCreateMapButtonClick: () => {
      dispatch(openCreateMapDialog());
    },

    refreshMyMaps: async () => {
      dispatch(loadMyMapsStart());
      const client = new ApiClient();
      let response = await client.fetchUserMaps();
      let maps = await response.json();
      dispatch(fetchMyMaps(maps));
      dispatch(loadMyMapsEnd());
    },

    refreshFollowingMaps: async () => {
      dispatch(loadFollowingMapsStart());
      const client = new ApiClient();
      let response = await client.fetchFollowingMaps();
      let maps = await response.json();
      dispatch(fetchFollowingMaps(maps));
      dispatch(loadFollowingMapsEnd());
    },

    handleMyMapsActive: () => {
      dispatch(switchMyMaps());
    },

    handleFollowingMapsActive: () => {
      dispatch(switchFollowingMaps());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Maps));

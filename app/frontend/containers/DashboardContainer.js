import { connect } from 'react-redux';
import Dashboard from '../ui/Dashboard';
import ApiClient from '../containers/ApiClient';
import openToast from '../actions/openToast';
import signOut from '../actions/signOut';
import { push } from 'react-router-redux';
import { GridList, GridListTile } from 'material-ui/GridList';

import CreateMapDialogContainer from '../containers/CreateMapDialogContainer';
import fetchMaps from '../actions/fetchMaps';
import fetchPopularMaps from '../actions/fetchPopularMaps';
import loadMapsStart from '../actions/loadMapsStart';
import loadMapsEnd from '../actions/loadMapsEnd';
import loadPopularMapsStart from '../actions/loadPopularMapsStart';
import loadPopularMapsEnd from '../actions/loadPopularMapsEnd';
import selectMap from  '../actions/selectMap';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import closeCreateMapDialog from '../actions/closeCreateMapDialog';

const mapStateToProps = (state) => {
  return {
    currentMaps: state.dashboard.currentMaps,
    popularMaps: state.dashboard.popularMaps,
    loadingMaps: state.dashboard.loadingMaps,
    loadingPopularMaps: state.dashboard.loadingPopularMaps,
    large: state.shared.large
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleCreateMapButtonClick: () => {
      dispatch(openCreateMapDialog());
    },

    refreshMaps: async () => {
      dispatch(loadMapsStart());
      const client = new ApiClient;
      let response = await client.fetchCurrentMaps();
      let maps = await response.json();
      dispatch(loadMapsEnd());
      if (response.ok) {
        dispatch(fetchMaps(maps));
      } else if (response.status == 401) {
        dispatch(signOut());
        dispatch(openToast('Authenticate failed'));
      } else {
        dispatch(openToast('Failed to fetch Maps.'));
      }
    },

    refreshPopularMaps: async () => {
      dispatch(loadPopularMapsStart());
      const client = new ApiClient;
      let response = await client.fetchPopularMaps();
      let maps = await response.json();
      dispatch(fetchPopularMaps(maps));
      dispatch(loadPopularMapsEnd());
    },

    handleClickMap: (map) => {
      dispatch(selectMap(map));
      dispatch(push(`/maps/${map.id}`));
      dispatch(openToast(`Log in to ${map.name}!`));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);

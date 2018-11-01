import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MapDetail from '../ui/MapDetail';
import ApiClient from './ApiClient';
import selectMap from '../actions/selectMap';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';
import openToast from '../actions/openToast';
import updatePageTitle from '../actions/updatePageTitle';
import requestCurrentPosition from '../actions/requestCurrentPosition';
import requestMapCenter from '../actions/requestMapCenter';
import fetchSpots from '../actions/fetchSpots';
import clearMapState from '../actions/clearMapState';
import fetchMapReviews from '../actions/fetchMapReviews';
import fetchCollaborators from '../actions/fetchCollaborators';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentMap: state.mapDetail.currentMap,
    currentSpot: state.spotCard.currentSpot,
    spotCardOpen: state.spotCard.spotCardOpen,
    mapSummaryOpen: state.mapDetail.mapSummaryOpen
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updatePageTitle: (mapName = undefined) => {
      dispatch(updatePageTitle(mapName ? mapName : 'Map'));
    },

    initCenter: map => {
      if (map.base.place_id) {
        dispatch(requestMapCenter(map.base.lat, map.base.lng));
      } else {
        dispatch(requestCurrentPosition());
      }
    },

    fetchMap: async () => {
      const client = new ApiClient();
      let response = await client.fetchMap(ownProps.match.params.mapId);
      if (response.ok) {
        let map = await response.json();
        dispatch(selectMap(map));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else if (response.status == 404) {
        ownProps.history.push('/maps');
      } else {
        dispatch(openToast('Failed to fetch Map.'));
      }
    },

    fetchSpots: async () => {
      const client = new ApiClient();
      let response = await client.fetchSpots(ownProps.match.params.mapId);
      if (response.ok) {
        let spots = await response.json();
        dispatch(fetchSpots(spots));
      }
    },

    fetchMapReviews: async () => {
      const client = new ApiClient();
      let response = await client.fetchMapReviews(ownProps.match.params.mapId);
      if (response.ok) {
        let reviews = await response.json();
        dispatch(fetchMapReviews(reviews));
      }
    },

    fetchFollowers: async () => {
      const client = new ApiClient();
      let response = await client.fetchCollaborators(
        ownProps.match.params.mapId
      );
      if (response.ok) {
        let followers = await response.json();
        dispatch(fetchCollaborators(followers));
      }
    },

    handleCreateReviewClick: () => {
      dispatch(openPlaceSelectDialog());
    },

    handleUnmount: () => {
      dispatch(clearMapState());
    }
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MapDetail));

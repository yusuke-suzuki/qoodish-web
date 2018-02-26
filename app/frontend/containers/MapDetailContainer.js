import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import MapDetail from '../ui/MapDetail';
import ApiClient from './ApiClient';
import selectMap from '../actions/selectMap';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';
import openToast from '../actions/openToast';
import updatePageTitle from '../actions/updatePageTitle';
import signOut from '../actions/signOut';
import requestCurrentPosition from '../actions/requestCurrentPosition';
import getMapBasePosition from '../actions/getMapBasePosition';
import requestMapBase from '../actions/requestMapBase';
import fetchSpots from '../actions/fetchSpots';
import fetchCollaborators from '../actions/fetchCollaborators';
import openSpotCard from '../actions/openSpotCard';
import clearMapState from '../actions/clearMapState';
import gMapMounted from '../actions/gMapMounted';
import mapZoomChanged from '../actions/mapZoomChanged';
import mapCenterChanged from '../actions/mapCenterChanged';
import openReviewDialog from '../actions/openReviewDialog';
import fetchMapReviews from '../actions/fetchMapReviews';
import selectSpot from '../actions/selectSpot';
import switchSummary from '../actions/switchSummary';
import switchMap from '../actions/switchMap';

const mapStateToProps = state => {
  return {
    gMap: state.gMap.gMap,
    currentMap: state.mapDetail.currentMap,
    defaultCenter: state.gMap.defaultCenter,
    defaultZoom: state.gMap.defaultZoom,
    center: state.gMap.center,
    zoom: state.gMap.zoom,
    spots: state.gMap.spots,
    currentPosition: state.gMap.currentPosition,
    directions: state.gMap.directions,
    large: state.shared.large,
    currentSpot: state.spotCard.currentSpot,
    tabValue: state.mapDetail.tabValue,
    hash: state.router.location.hash
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle('Map'));
    },

    fetchMap: async () => {
      const client = new ApiClient();
      let response = await client.fetchMap(ownProps.match.params.mapId);
      if (response.ok) {
        let map = await response.json();
        dispatch(selectMap(map));
      } else if (response.status == 401) {
        dispatch(signOut());
        dispatch(openToast('Authenticate failed'));
      } else if (response.status == 404) {
        dispatch(push('/maps'));
      } else {
        dispatch(openToast('Failed to fetch Map.'));
      }
    },

    initCenter: async map => {
      if (map.base.place_id) {
        dispatch(getMapBasePosition(map.base.lat, map.base.lng));
        dispatch(requestMapBase());
      } else {
        dispatch(requestCurrentPosition());
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

    fetchCollaborators: async () => {
      const client = new ApiClient();
      let response = await client.fetchCollaborators(
        ownProps.match.params.mapId
      );
      if (response.ok) {
        let collaborators = await response.json();
        dispatch(fetchCollaborators(collaborators));
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

    handleCreateReviewClick: () => {
      dispatch(openPlaceSelectDialog());
    },

    onSpotMarkerClick: async spot => {
      dispatch(selectSpot(spot));
      dispatch(openSpotCard());
    },

    onMapMounted: map => {
      dispatch(gMapMounted(map));
    },

    onZoomChanged: zoom => {
      dispatch(mapZoomChanged(zoom));
    },

    onCenterChanged: center => {
      dispatch(mapCenterChanged({ lat: center.lat(), lng: center.lng() }));
    },

    handleUnmount: () => {
      dispatch(clearMapState());
    },

    switchSummary: () => {
      dispatch(switchSummary());
    },

    switchMap: () => {
      dispatch(switchMap());
    },

    handleSummaryTabClick: () => {
      dispatch(push(`/maps/${ownProps.match.params.mapId}#summary`));
    },

    handleMapTabClick: () => {
      dispatch(push(`/maps/${ownProps.match.params.mapId}#map`));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapDetail);

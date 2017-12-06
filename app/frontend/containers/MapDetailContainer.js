import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import MapDetail from '../ui/MapDetail';
import ApiClient from './ApiClient';
import selectMap from  '../actions/selectMap';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';
import openToast from '../actions/openToast';
import updatePageTitle from '../actions/updatePageTitle';
import signOut from '../actions/signOut';
import getCurrentPosition from '../actions/getCurrentPosition';
import requestCurrentPosition from '../actions/requestCurrentPosition';
import getMapBasePosition from '../actions/getMapBasePosition';
import requestMapBase from '../actions/requestMapBase';
import fetchSpots from '../actions/fetchSpots';
import fetchCollaborators from '../actions/fetchCollaborators';
import openSpotDetail from '../actions/openSpotDetail';
import openMapSummary from '../actions/openMapSummary';
import closeMapSummary from '../actions/closeMapSummary';
import fetchSpotReviews from '../actions/fetchSpotReviews';
import clearMapState from '../actions/clearMapState';
import gMapMounted from '../actions/gMapMounted';
import mapZoomChanged from '../actions/mapZoomChanged';
import mapCenterChanged from '../actions/mapCenterChanged';
import { fetchCurrentPosition } from './Utils';
import openReviewDialog from '../actions/openReviewDialog';

const mapStateToProps = (state) => {
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
    large: state.shared.large
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle('Map'));
    },

    openMapSummary: () => {
      dispatch(openMapSummary());
    },

    closeMapSummary: () => {
      dispatch(closeMapSummary());
    },

    fetchMap: async () => {
      const client = new ApiClient;
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

    initCenter: async (map) => {
      let position = await fetchCurrentPosition();
      dispatch(getCurrentPosition(position.coords.latitude, position.coords.longitude));
      if (map.base.place_id) {
        dispatch(getMapBasePosition(map.base.lat, map.base.lng));
        dispatch(requestMapBase());
      } else {
        dispatch(requestCurrentPosition());
      }
    },

    fetchSpots: async (mapId = ownProps.match.params.mapId) => {
      const client = new ApiClient;
      let response = await client.fetchSpots(mapId);
      if (response.ok) {
        let spots = await response.json();
        dispatch(fetchSpots(spots));
      }
    },

    fetchCollaborators: async () => {
      const client = new ApiClient;
      let response = await client.fetchCollaborators(ownProps.match.params.mapId);
      if (response.ok) {
        let collaborators = await response.json();
        dispatch(fetchCollaborators(collaborators));
      }
    },

    handleCreateReviewClick: () => {
      dispatch(openPlaceSelectDialog());
    },

    onSpotMarkerClick: async (spot) => {
      const client = new ApiClient;
      let response = await client.fetchSpotReviews(ownProps.match.params.mapId, spot.place_id);
      if (response.ok) {
        let reviews = await response.json();
        dispatch(fetchSpotReviews(reviews));
        dispatch(openSpotDetail(spot));
      }
    },

    onMapMounted: (map) => {
      dispatch(gMapMounted(map));
    },

    onZoomChanged: (zoom) => {
      dispatch(mapZoomChanged(zoom));
    },

    onCenterChanged: (center) => {
      dispatch(mapCenterChanged({ lat: center.lat(), lng: center.lng() }));
    },

    handleUnmount: () => {
      dispatch(clearMapState());
    },

    fetchReview: async () => {
      const client = new ApiClient;
      let response = await client.fetchReview(ownProps.match.params.mapId, ownProps.match.params.reviewId);
      if (response.ok) {
        let review = await response.json();
        dispatch(openReviewDialog(review));
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapDetail);

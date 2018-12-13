import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MapDetail from '../ui/MapDetail';
import ApiClient from './ApiClient';
import selectMap from '../actions/selectMap';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';
import openToast from '../actions/openToast';
import requestCurrentPosition from '../actions/requestCurrentPosition';
import requestMapCenter from '../actions/requestMapCenter';
import fetchSpots from '../actions/fetchSpots';
import clearMapState from '../actions/clearMapState';
import fetchMapReviews from '../actions/fetchMapReviews';
import fetchCollaborators from '../actions/fetchCollaborators';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentMap: state.mapDetail.currentMap,
    currentSpot: state.spotCard.currentSpot,
    spotCardOpen: state.spotCard.spotCardOpen,
    mapSummaryOpen: state.mapDetail.mapSummaryOpen
  };
};

const dispatchGtag = (map) => {
  gtag('config', process.env.GA_TRACKING_ID, {
    'page_path': `/maps/${map.id}`,
    'page_title': `${map.name} | Qoodish`
  });
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchMap: async () => {
      const client = new ApiClient();
      let response = await client.fetchMap(ownProps.match.params.mapId);
      if (response.ok) {
        let map = await response.json();
        dispatch(selectMap(map));
        dispatchGtag(map);

        if (map.base.place_id) {
          dispatch(requestMapCenter(map.base.lat, map.base.lng));
        } else {
          dispatch(requestCurrentPosition());
        }
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else if (response.status == 404) {
        ownProps.history.push('');
        dispatch(openToast(I18n.t('map not found')));
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

export default React.memo(withRouter(connect(mapStateToProps, mapDispatchToProps)(MapDetail)));

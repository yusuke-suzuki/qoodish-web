import React from 'react';
import { connect } from 'react-redux';
import Discover from './Discover';
import ApiClient from '../../../utils/ApiClient';
import openToast from '../../../actions/openToast';

import loadRecentReviewsStart from '../../../actions/loadRecentReviewsStart';
import loadRecentReviewsEnd from '../../../actions/loadRecentReviewsEnd';
import fetchRecentReviews from '../../../actions/fetchRecentReviews';

import loadActiveMapsStart from '../../../actions/loadActiveMapsStart';
import loadActiveMapsEnd from '../../../actions/loadActiveMapsEnd';
import fetchActiveMaps from '../../../actions/fetchActiveMaps';

import loadRecentMapsStart from '../../../actions/loadRecentMapsStart';
import loadRecentMapsEnd from '../../../actions/loadRecentMapsEnd';
import fetchRecentMaps from '../../../actions/fetchRecentMaps';

import loadPopularMapsStart from '../../../actions/loadPopularMapsStart';
import loadPopularMapsEnd from '../../../actions/loadPopularMapsEnd';
import fetchPopularMaps from '../../../actions/fetchPopularMaps';

import loadTrendingSpotsStart from '../../../actions/loadTrendingSpotsStart';
import loadTrendingSpotsEnd from '../../../actions/loadTrendingSpotsEnd';
import fetchTrendingSpots from '../../../actions/fetchTrendingSpots';

import selectMap from '../../../actions/selectMap';
import pickUpMap from '../../../actions/pickUpMap';
import openReviewDialog from '../../../actions/openReviewDialog';

const mapStateToProps = state => {
  return {
    mapPickedUp: state.discover.mapPickedUp,
    activeMaps: state.discover.activeMaps,
    recentMaps: state.discover.recentMaps,
    popularMaps: state.discover.popularMaps,
    loadingActiveMaps: state.discover.loadingActiveMaps,
    loadingRecentMaps: state.discover.loadingRecentMaps,
    loadingPopularMaps: state.discover.loadingPopularMaps,
    large: state.shared.large,
    loadingTrendingSpots: state.discover.loadingTrendingSpots,
    trendingSpots: state.discover.trendingSpots
  };
};

const mapDispatchToProps = dispatch => {
  return {
    pickUpMap: async () => {
      const client = new ApiClient();
      let response = await client.fetchMap(process.env.PICKED_UP_MAP_ID);
      let map = await response.json();
      if (response.ok) {
        dispatch(pickUpMap(map));
      }
    },

    fetchTrendingSpots: async () => {
      dispatch(loadTrendingSpotsStart());
      const client = new ApiClient();
      let response = await client.fetchTrendingSpots();
      let spots = await response.json();
      dispatch(loadTrendingSpotsEnd());
      if (response.ok) {
        dispatch(fetchTrendingSpots(spots));
      }
    },

    fetchRecentReviews: async () => {
      dispatch(loadRecentReviewsStart());
      const client = new ApiClient();
      let response = await client.fetchRecentReviews();
      let reviews = await response.json();
      dispatch(loadRecentReviewsEnd());
      if (response.ok) {
        dispatch(fetchRecentReviews(reviews));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else {
        dispatch(openToast('Failed to fetch recent reviews.'));
      }
    },

    refreshActiveMaps: async () => {
      dispatch(loadActiveMapsStart());
      const client = new ApiClient();
      let response = await client.fetchActiveMaps();
      let maps = await response.json();
      dispatch(fetchActiveMaps(maps));
      dispatch(loadActiveMapsEnd());
    },

    refreshRecentMaps: async () => {
      dispatch(loadRecentMapsStart());
      const client = new ApiClient();
      let response = await client.fetchRecentMaps();
      let maps = await response.json();
      dispatch(fetchRecentMaps(maps));
      dispatch(loadRecentMapsEnd());
    },

    refreshPopularMaps: async () => {
      dispatch(loadPopularMapsStart());
      const client = new ApiClient();
      let response = await client.fetchPopularMaps();
      let maps = await response.json();
      dispatch(fetchPopularMaps(maps));
      dispatch(loadPopularMapsEnd());
    },

    handleClickMap: map => {
      if (!map) {
        return;
      }
      dispatch(selectMap(map));
    },

    handleClickReview: review => {
      dispatch(openReviewDialog(review));
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Discover)
);

import React from 'react';
import { connect } from 'react-redux';
import Discover from '../ui/Discover';
import ApiClient from '../containers/ApiClient';
import openToast from '../actions/openToast';

import fetchRecentReviews from '../actions/fetchRecentReviews';
import fetchRecentMaps from '../actions/fetchRecentMaps';
import fetchPopularMaps from '../actions/fetchPopularMaps';
import fetchTrendingSpots from '../actions/fetchTrendingSpots';
import loadRecentReviewsStart from '../actions/loadRecentReviewsStart';
import loadRecentReviewsEnd from '../actions/loadRecentReviewsEnd';
import loadRecentMapsStart from '../actions/loadRecentMapsStart';
import loadRecentMapsEnd from '../actions/loadRecentMapsEnd';
import loadPopularMapsStart from '../actions/loadPopularMapsStart';
import loadPopularMapsEnd from '../actions/loadPopularMapsEnd';
import loadTrendingSpotsStart from '../actions/loadTrendingSpotsStart';
import loadTrendingSpotsEnd from '../actions/loadTrendingSpotsEnd';
import selectMap from '../actions/selectMap';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import pickUpMap from '../actions/pickUpMap';
import openReviewDialog from '../actions/openReviewDialog';

const mapStateToProps = state => {
  return {
    mapPickedUp: state.discover.mapPickedUp,
    recentMaps: state.discover.recentMaps,
    popularMaps: state.discover.popularMaps,
    loadingRecentMaps: state.discover.loadingRecentMaps,
    loadingPopularMaps: state.discover.loadingPopularMaps,
    large: state.shared.large,
    recentReviews: state.discover.recentReviews,
    loadingRecentReviews: state.discover.loadingRecentReviews,
    loadingTrendingSpots: state.discover.loadingTrendingSpots,
    trendingSpots: state.discover.trendingSpots
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleCreateMapButtonClick: () => {
      dispatch(openCreateMapDialog());
    },

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
      dispatch(openToast(`Log in to ${map.name}!`));
    },

    handleClickReview: review => {
      dispatch(openReviewDialog(review));
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Discover));

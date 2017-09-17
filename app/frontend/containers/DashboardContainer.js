import { connect } from 'react-redux';
import Dashboard from '../ui/Dashboard';
import ApiClient from '../containers/ApiClient';
import openToast from '../actions/openToast';
import signOut from '../actions/signOut';
import { push } from 'react-router-redux';
import { GridList, GridListTile } from 'material-ui/GridList';

import CreateMapDialogContainer from '../containers/CreateMapDialogContainer';
import fetchRecentReviews from '../actions/fetchRecentReviews';
import fetchPopularMaps from '../actions/fetchPopularMaps';
import loadRecentReviewsStart from '../actions/loadRecentReviewsStart';
import loadRecentReviewsEnd from '../actions/loadRecentReviewsEnd';
import loadPopularMapsStart from '../actions/loadPopularMapsStart';
import loadPopularMapsEnd from '../actions/loadPopularMapsEnd';
import selectMap from  '../actions/selectMap';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import pickUpMap from '../actions/pickUpMap';

const mapStateToProps = (state) => {
  return {
    mapPickedUp: state.dashboard.mapPickedUp,
    currentMaps: state.dashboard.currentMaps,
    popularMaps: state.dashboard.popularMaps,
    loadingMaps: state.dashboard.loadingMaps,
    loadingPopularMaps: state.dashboard.loadingPopularMaps,
    large: state.shared.large,
    recentReviews: state.dashboard.recentReviews,
    loadingRecentReviews: state.dashboard.loadingRecentReviews
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleCreateMapButtonClick: () => {
      dispatch(openCreateMapDialog());
    },

    pickUpMap: async () => {
      const client = new ApiClient;
      let response = await client.fetchMap(process.env.PICKED_UP_MAP_ID);
      let map = await response.json();
      if (response.ok) {
        dispatch(pickUpMap(map));
      }
    },

    fetchRecentReviews: async () => {
      dispatch(loadRecentReviewsStart());
      const client = new ApiClient;
      let response = await client.fetchRecentReviews();
      let reviews = await response.json();
      dispatch(loadRecentReviewsEnd());
      if (response.ok) {
        dispatch(fetchRecentReviews(reviews));
      } else if (response.status == 401) {
        dispatch(signOut());
        dispatch(openToast('Authenticate failed'));
      } else {
        dispatch(openToast('Failed to fetch recent reviews.'));
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
    },

    handleClickReview: (review) => {
      dispatch(push(`/maps/${review.map_id}/reports/${review.id}`));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);

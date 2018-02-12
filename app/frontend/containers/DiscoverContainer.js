import { connect } from 'react-redux';
import Discover from '../ui/Discover';
import ApiClient from '../containers/ApiClient';
import openToast from '../actions/openToast';
import signOut from '../actions/signOut';
import { push } from 'react-router-redux';

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
import updatePageTitle from '../actions/updatePageTitle';
import selectReview from '../actions/selectReview';

const mapStateToProps = (state) => {
  return {
    mapPickedUp: state.discover.mapPickedUp,
    popularMaps: state.discover.popularMaps,
    loadingPopularMaps: state.discover.loadingPopularMaps,
    large: state.shared.large,
    recentReviews: state.discover.recentReviews,
    loadingRecentReviews: state.discover.loadingRecentReviews
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle('Discover'));
    },

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
      dispatch(selectReview(review));
      dispatch(push(`/maps/${review.map_id}/reports/${review.id}`));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Discover);

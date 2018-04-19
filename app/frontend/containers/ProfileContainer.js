import { connect } from 'react-redux';
import Profile from '../ui/Profile';
import updatePageTitle from '../actions/updatePageTitle';
import fetchUserProfile from '../actions/fetchUserProfile';
import fetchUserMaps from '../actions/fetchUserMaps';
import loadUserMapsStart from '../actions/loadUserMapsStart';
import loadUserMapsEnd from '../actions/loadUserMapsEnd';
import fetchUserReviews from '../actions/fetchUserReviews';
import fetchMoreUserReviews from '../actions/fetchMoreUserReviews';
import loadUserReviewsStart from '../actions/loadUserReviewsStart';
import loadUserReviewsEnd from '../actions/loadUserReviewsEnd';
import loadMoreUserReviewsStart from '../actions/loadMoreUserReviewsStart';
import loadMoreUserReviewsEnd from '../actions/loadMoreUserReviewsEnd';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import clearProfileState from '../actions/clearProfileState';
import ApiClient from './ApiClient.js';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentUser: state.app.currentUser,
    defaultZoom: state.gMap.defaultZoom,
    center: state.gMap.center,
    currentMaps: state.profile.currentMaps,
    loadingMaps: state.profile.loadingMaps,
    currentReviews: state.profile.currentReviews,
    loadingReviews: state.profile.loadingReviews,
    loadingMoreReviews: state.profile.loadingMoreReviews,
    noMoreReviews: state.profile.noMoreReviews,
    nextTimestamp: state.profile.nextTimestamp
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle('Profile'));
    },

    fetchUserProfile: async () => {
      const client = new ApiClient();
      let response = await client.fetchUser();
      let user = await response.json();
      dispatch(fetchUserProfile(user));
    },

    fetchReviews: async () => {
      dispatch(loadUserReviewsStart());
      const client = new ApiClient();
      let response = await client.fetchUserReviews();
      let reviews = await response.json();
      dispatch(loadUserReviewsEnd());
      dispatch(fetchUserReviews(reviews));
    },

    loadMoreReviews: async timestamp => {
      dispatch(loadMoreUserReviewsStart());
      const client = new ApiClient();
      let response = await client.fetchUserReviews(undefined, timestamp);
      let reviews = await response.json();
      dispatch(loadMoreUserReviewsEnd());
      dispatch(fetchMoreUserReviews(reviews));
    },

    fetchUserMaps: async () => {
      dispatch(loadUserMapsStart());
      const client = new ApiClient();
      let response = await client.fetchUserMaps();
      let maps = await response.json();
      dispatch(fetchUserMaps(maps));
      dispatch(loadUserMapsEnd());
    },

    handleCreateMapButtonClick: () => {
      dispatch(openCreateMapDialog());
    },

    clearProfileState: () => {
      dispatch(clearProfileState());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

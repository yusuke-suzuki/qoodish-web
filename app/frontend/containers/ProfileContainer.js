import { connect } from 'react-redux';
import Profile from '../ui/Profile';
import { push } from 'react-router-redux';
import updatePageTitle from '../actions/updatePageTitle';
import fetchMyProfile from '../actions/fetchMyProfile';
import fetchMyMaps from '../actions/fetchMyMaps';
import fetchFollowingMaps from '../actions/fetchFollowingMaps';
import loadMyMapsStart from '../actions/loadMyMapsStart';
import loadMyMapsEnd from '../actions/loadMyMapsEnd';
import fetchMyReviews from '../actions/fetchMyReviews';
import fetchMoreMyReviews from '../actions/fetchMoreMyReviews';
import loadMyReviewsStart from '../actions/loadMyReviewsStart';
import loadMyReviewsEnd from '../actions/loadMyReviewsEnd';
import loadMoreMyReviewsStart from '../actions/loadMoreMyReviewsStart';
import loadMoreMyReviewsEnd from '../actions/loadMoreMyReviewsEnd';
import selectMap from '../actions/selectMap';
import openToast from '../actions/openToast';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import clearProfileState from '../actions/clearProfileState';
import ApiClient from './ApiClient.js';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentUser: state.app.currentUser,
    defaultZoom: state.gMap.defaultZoom,
    center: state.gMap.center,
    myMaps: state.maps.myMaps,
    loadingMyMaps: state.maps.loadingMyMaps,
    currentReviews: state.profile.currentReviews,
    loadingReviews: state.profile.loadingReviews,
    loadingMoreReviews: state.profile.loadingMoreReviews,
    noMoreReviews: state.profile.noMoreReviews,
    nextTimestamp: state.profile.nextTimestamp
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle('Profile'));
    },

    fetchProfile: async uid => {
      const client = new ApiClient();
      let response = await client.fetchUser(uid);
      let user = await response.json();
      dispatch(fetchMyProfile(user));
    },

    fetchReviews: async () => {
      dispatch(loadMyReviewsStart());
      const client = new ApiClient();
      let response = await client.fetchMyReviews();
      let reviews = await response.json();
      dispatch(loadMyReviewsEnd());
      dispatch(fetchMyReviews(reviews));
    },

    loadMoreReviews: async timestamp => {
      dispatch(loadMoreMyReviewsStart());
      const client = new ApiClient();
      let response = await client.fetchMyReviews(timestamp);
      let reviews = await response.json();
      dispatch(loadMoreMyReviewsEnd());
      dispatch(fetchMoreMyReviews(reviews));
    },

    fetchMyMaps: async () => {
      dispatch(loadMyMapsStart());
      const client = new ApiClient();
      let response = await client.fetchMyMaps();
      let maps = await response.json();
      dispatch(fetchMyMaps(maps));
      dispatch(loadMyMapsEnd());
    },

    handleClickMap: map => {
      dispatch(selectMap(map));
      dispatch(push(`/maps/${map.id}`, {
        previous: true
      }));
      dispatch(openToast(`Log in to ${map.name}!`));
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

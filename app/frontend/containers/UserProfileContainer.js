import React from 'react';
import { connect } from 'react-redux';
import Profile from '../ui/Profile';
import fetchUserProfile from '../actions/fetchUserProfile';
import fetchMyMaps from '../actions/fetchMyMaps';
import fetchFollowingMaps from '../actions/fetchFollowingMaps';
import loadMyMapsStart from '../actions/loadMyMapsStart';
import loadMyMapsEnd from '../actions/loadMyMapsEnd';
import loadFollowingMapsStart from '../actions/loadFollowingMapsStart';
import loadFollowingMapsEnd from '../actions/loadFollowingMapsEnd';
import fetchUserReviews from '../actions/fetchUserReviews';
import fetchMoreUserReviews from '../actions/fetchMoreUserReviews';
import loadUserReviewsStart from '../actions/loadUserReviewsStart';
import loadUserReviewsEnd from '../actions/loadUserReviewsEnd';
import loadMoreUserReviewsStart from '../actions/loadMoreUserReviewsStart';
import loadMoreUserReviewsEnd from '../actions/loadMoreUserReviewsEnd';
import clearProfileState from '../actions/clearProfileState';
import ApiClient from './ApiClient.js';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentUser: state.profile.currentUser,
    defaultZoom: state.gMap.defaultZoom,
    center: state.gMap.center,
    myMaps: state.profile.myMaps,
    followingMaps: state.profile.followingMaps,
    loadingMyMaps: state.profile.loadingMyMaps,
    loadingFollowingMaps: state.profile.loadingFollowingMaps,
    currentReviews: state.profile.currentReviews,
    loadingReviews: state.profile.loadingReviews,
    loadingMoreReviews: state.profile.loadingMoreReviews,
    noMoreReviews: state.profile.noMoreReviews,
    nextTimestamp: state.profile.nextTimestamp,
    pathname: state.shared.currentLocation
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchUserProfile: async () => {
      const client = new ApiClient();
      let response = await client.fetchUser(ownProps.match.params.userId);
      let user = await response.json();
      dispatch(fetchUserProfile(user));
    },

    fetchReviews: async () => {
      dispatch(loadUserReviewsStart());
      const client = new ApiClient();
      let response = await client.fetchUserReviews(ownProps.match.params.userId);
      let reviews = await response.json();
      dispatch(loadUserReviewsEnd());
      dispatch(fetchUserReviews(reviews));
    },

    loadMoreReviews: async timestamp => {
      dispatch(loadMoreUserReviewsStart());
      const client = new ApiClient();
      let response = await client.fetchUserReviews(ownProps.match.params.userId, timestamp);
      let reviews = await response.json();
      dispatch(loadMoreUserReviewsEnd());
      dispatch(fetchMoreUserReviews(reviews));
    },

    fetchMyMaps: async () => {
      dispatch(loadMyMapsStart());
      const client = new ApiClient();
      let response = await client.fetchMyMaps(ownProps.match.params.userId);
      let maps = await response.json();
      dispatch(fetchMyMaps(maps));
      dispatch(loadMyMapsEnd());
    },

    fetchFollowingMaps: async () => {
      dispatch(loadFollowingMapsStart());
      const client = new ApiClient();
      let response = await client.fetchFollowingMaps();
      let maps = await response.json();
      dispatch(fetchFollowingMaps(maps));
      dispatch(loadFollowingMapsEnd());
    },

    clearProfileState: () => {
      dispatch(clearProfileState());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Profile));

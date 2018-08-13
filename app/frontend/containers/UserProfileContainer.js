import { connect } from 'react-redux';
import Profile from '../ui/Profile';
import { push } from 'react-router-redux';
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
import selectMap from '../actions/selectMap';
import openToast from '../actions/openToast';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import clearProfileState from '../actions/clearProfileState';
import ApiClient from './ApiClient.js';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentUser: state.profile.currentUser,
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

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle(I18n.t('account')));
    },

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

    fetchUserMaps: async () => {
      dispatch(loadUserMapsStart());
      const client = new ApiClient();
      let response = await client.fetchUserMaps(ownProps.match.params.userId);
      let maps = await response.json();
      dispatch(fetchUserMaps(maps));
      dispatch(loadUserMapsEnd());
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

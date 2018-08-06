import { connect } from 'react-redux';
import Timeline from '../ui/Timeline';
import ApiClient from '../containers/ApiClient';
import openToast from '../actions/openToast';
import fetchReviews from '../actions/fetchReviews';
import fetchMoreReviews from '../actions/fetchMoreReviews';
import loadReviewsStart from '../actions/loadReviewsStart';
import loadReviewsEnd from '../actions/loadReviewsEnd';
import loadMoreReviewsStart from '../actions/loadMoreReviewsStart';
import loadMoreReviewsEnd from '../actions/loadMoreReviewsEnd';
import updatePageTitle from '../actions/updatePageTitle';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    currentReviews: state.reviews.currentReviews,
    loadingReviews: state.reviews.loadingReviews,
    loadingMoreReviews: state.reviews.loadingMoreReviews,
    noMoreReviews: state.reviews.noMoreReviews,
    nextTimestamp: state.reviews.nextTimestamp,
    large: state.shared.large,
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle(I18n.t('home')));
    },

    refreshReviews: async () => {
      dispatch(loadReviewsStart());
      const client = new ApiClient();
      let response = await client.fetchReviews();
      let reviews = await response.json();
      dispatch(loadReviewsEnd());
      if (response.ok) {
        dispatch(fetchReviews(reviews));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else {
        dispatch(openToast('Failed to fetch reports.'));
      }
    },

    loadMoreReviews: async timestamp => {
      dispatch(loadMoreReviewsStart());
      const client = new ApiClient();
      let response = await client.fetchReviews(timestamp);
      let reviews = await response.json();
      dispatch(loadMoreReviewsEnd());
      if (response.ok) {
        dispatch(fetchMoreReviews(reviews));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else {
        dispatch(openToast('Failed to fetch reports.'));
      }
    },

    handleCreateReviewClick: (currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(openPlaceSelectDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);

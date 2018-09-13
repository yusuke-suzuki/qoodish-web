import { connect } from 'react-redux';
import ReviewCard from '../ui/ReviewCard';
import openEditReviewDialog from '../actions/openEditReviewDialog';
import openCopyReviewDialog from '../actions/openCopyReviewDialog';
import openDeleteReviewDialog from '../actions/openDeleteReviewDialog';
import openToast from '../actions/openToast';
import openIssueDialog from '../actions/openIssueDialog';
import ApiClient from './ApiClient';
import likeReview from '../actions/likeReview';
import unlikeReview from '../actions/unlikeReview';
import fetchReviewLikes from '../actions/fetchReviewLikes';
import openLikesDialog from '../actions/openLikesDialog';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleUrlCopied: () => {
      dispatch(openToast('Copied!'));
    },

    handleEditReviewButtonClick: review => {
      dispatch(openEditReviewDialog(review));
    },

    handleCopyReviewButtonClick: review => {
      dispatch(openCopyReviewDialog(review));
    },

    handleDeleteReviewButtonClick: review => {
      dispatch(openDeleteReviewDialog(review));
    },

    handleIssueButtonClick: (currentUser, review) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(openIssueDialog(review.id, 'review'));
    },

    handleLikeButtonClick: async (currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      const client = new ApiClient();
      let response = await client.likeReview(ownProps.currentReview.id);
      if (response.ok) {
        let review = await response.json();
        dispatch(likeReview(review));
        dispatch(openToast('Liked!'));

        gtag('event', 'like', {
          'event_category': 'engagement',
          'event_label': 'review'
        });
      } else {
        dispatch(openToast('Request failed.'));
      }
    },

    handleUnlikeButtonClick: async () => {
      const client = new ApiClient();
      let response = await client.unlikeReview(ownProps.currentReview.id);
      if (response.ok) {
        let review = await response.json();
        dispatch(unlikeReview(review));
        dispatch(openToast('Unliked!'));

        gtag('event', 'unlike', {
          'event_category': 'engagement',
          'event_label': 'review'
        });
      } else {
        dispatch(openToast('Request failed.'));
      }
    },

    handleLikesClick: async () => {
      const client = new ApiClient();
      let response = await client.fetchReviewLikes(ownProps.currentReview.id);
      if (response.ok) {
        let likes = await response.json();
        dispatch(fetchReviewLikes(likes));
        dispatch(openLikesDialog());
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReviewCard);

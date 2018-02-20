import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import ReviewCard from '../ui/ReviewCard';
import openEditReviewDialog from '../actions/openEditReviewDialog';
import openDeleteReviewDialog from '../actions/openDeleteReviewDialog';
import openToast from '../actions/openToast';
import openIssueDialog from '../actions/openIssueDialog';
import ApiClient from './ApiClient';
import likeReview from '../actions/likeReview';
import unlikeReview from '../actions/unlikeReview';
import fetchReviewLikes from '../actions/fetchReviewLikes';
import openLikesDialog from '../actions/openLikesDialog';
import selectSpot from '../actions/selectSpot';
import closeReviewDialog from '../actions/closeReviewDialog';

const mapStateToProps = (state) => {
  return {
    large :state.shared.large
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleMapClick: () => {
      dispatch(push(`/maps/${ownProps.currentReview.map_id}`));
    },

    handleSpotNameClick: async (spot) => {
      dispatch(closeReviewDialog());
      dispatch(selectSpot(spot));
      dispatch(push(`/spots/${spot.place_id}`));
    },

    handleTweetButtonClick: (review) => {
      let url = `${process.env.ENDPOINT}/maps/${review.map_id}/reports/${review.id}`;
      let text = `「${review.map_name}」にレポートを投稿しました。`;
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
    },

    handleFacebookButtonClick: (review) => {
      let url = `${process.env.ENDPOINT}/maps/${review.map_id}/reports/${review.id}`;
      window.open(`https://www.facebook.com/dialog/share?app_id=${process.env.FB_APP_ID}&href=${url}`);
    },

    handleUrlCopied: () => {
      dispatch(openToast('Copied!'));
    },

    handleEditReviewButtonClick: (review) => {
      dispatch(openEditReviewDialog(review));
    },

    handleDeleteReviewButtonClick: (review) => {
      dispatch(openDeleteReviewDialog(review));
    },

    handleIssueButtonClick: (review) => {
      dispatch(openIssueDialog(review.id, 'review'))
    },

    handleLikeButtonClick: async () => {
      const client = new ApiClient;
      let response = await client.likeReview(ownProps.currentReview.id);
      if (response.ok) {
        let review = await response.json();
        dispatch(likeReview(review));
        dispatch(openToast('Liked!'));
      } else {
        dispatch(openToast('Request failed.'));
      }
    },

    handleUnlikeButtonClick: async () => {
      const client = new ApiClient;
      let response = await client.unlikeReview(ownProps.currentReview.id);
      if (response.ok) {
        let review = await response.json();
        dispatch(unlikeReview(review));
        dispatch(openToast('Unliked!'));
      } else {
        dispatch(openToast('Request failed.'));
      }
    },

    handleLikesClick: async () => {
      const client = new ApiClient;
      let response = await client.fetchReviewLikes(ownProps.currentReview.id);
      if (response.ok) {
        let likes = await response.json();
        dispatch(fetchReviewLikes(likes));
        dispatch(openLikesDialog());
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewCard);

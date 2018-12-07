import React from 'react';
import { connect } from 'react-redux';
import ReviewCardActions from '../ui/ReviewCardActions';
import openToast from '../actions/openToast';
import ApiClient from './ApiClient';
import likeReview from '../actions/likeReview';
import unlikeReview from '../actions/unlikeReview';
import fetchReviewLikes from '../actions/fetchReviewLikes';
import openLikesDialog from '../actions/openLikesDialog';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleLikeButtonClick: async (currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      const client = new ApiClient();
      let response = await client.likeReview(ownProps.review.id);
      if (response.ok) {
        let review = await response.json();
        dispatch(likeReview(review));
        dispatch(openToast(I18n.t('liked!')));

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
      let response = await client.unlikeReview(ownProps.review.id);
      if (response.ok) {
        let review = await response.json();
        dispatch(unlikeReview(review));
        dispatch(openToast(I18n.t('unliked')));

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
      let response = await client.fetchReviewLikes(ownProps.review.id);
      if (response.ok) {
        let likes = await response.json();
        dispatch(fetchReviewLikes(likes));
        dispatch(openLikesDialog());
      }
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(ReviewCardActions));

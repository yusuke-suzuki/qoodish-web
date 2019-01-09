import React from 'react';
import { connect } from 'react-redux';
import CopyReviewDialog from '../ui/CopyReviewDialog';
import ApiClient from './ApiClient';
import closeCopyReviewDialog from '../actions/closeCopyReviewDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import createReview from '../actions/createReview';
import fetchPostableMaps from '../actions/fetchPostableMaps';
import uploadToStorage from '../utils/uploadToStorage';
import deleteFromStorage from '../utils/deleteFromStorage';
import downloadImage from '../utils/downloadImage';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    dialogOpen: state.reviews.copyReviewDialogOpen,
    postableMaps: state.maps.postableMaps,
    currentReview: state.reviews.targetReview,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRequestClose: () => {
      dispatch(closeCopyReviewDialog());
    },

    handleMapSelected: async (review, map) => {
      dispatch(requestStart());
      const params = {
        comment: review.comment,
        place_id: review.place_id
      };
      let fileName;
      if (review.image) {
        const blob = await downloadImage(review.image.url);
        const uploadResponse = await uploadToStorage(blob);
        params.image_url = uploadResponse.imageUrl;
        fileName = uploadResponse.fileName;
      }
      const client = new ApiClient();
      let response = await client.createReview(map.id, params);
      let json = await response.json();
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(closeCopyReviewDialog());
        dispatch(createReview(json));
        dispatch(openToast(I18n.t('copy report success')));
        gtag('event', 'create', {
          event_category: 'engagement',
          event_label: 'review'
        });
      } else {
        dispatch(openToast(json.detail));
        if (fileName) {
          deleteFromStorage(fileName);
        }
      }
    },

    fetchPostableMaps: async () => {
      const client = new ApiClient();
      let response = await client.fetchPostableMaps();
      if (response.ok) {
        let maps = await response.json();
        dispatch(fetchPostableMaps(maps));
      }
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CopyReviewDialog)
);

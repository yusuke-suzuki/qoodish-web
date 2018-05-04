import { connect } from 'react-redux';
import CopyReviewDialog from '../ui/CopyReviewDialog';
import ApiClient from './ApiClient';
import closeCopyReviewDialog from '../actions/closeCopyReviewDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import createReview from '../actions/createReview';
import { uploadToStorage, deleteFromStorage, downloadImage } from './Utils';

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
        dispatch(openToast('Successfully copied report!'));
        gtag('event', 'create', {
          'event_category': 'engagement',
          'event_label': 'review'
        });
      } else {
        dispatch(openToast(json.detail));
        if (fileName) {
          deleteFromStorage(fileName);
        }
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CopyReviewDialog);

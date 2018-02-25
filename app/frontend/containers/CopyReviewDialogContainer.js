import { connect } from 'react-redux';
import CopyReviewDialog from '../ui/CopyReviewDialog';
import ApiClient from './ApiClient';
import closeCopyReviewDialog from '../actions/closeCopyReviewDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import createReview from '../actions/createReview';

const mapStateToProps = (state) => {
  return {
    dialogOpen: state.reviews.copyReviewDialogOpen,
    postableMaps: state.maps.postableMaps,
    currentReview: state.reviews.targetReview,
    large: state.shared.large
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleRequestClose: () => {
      dispatch(closeCopyReviewDialog());
    },

    handleMapSelected: async (review, map) => {
      dispatch(requestStart());
      let params = {
        comment: review.comment,
        place_id: review.place_id
      };
      if (review.image) {
        params.image_url = review.image.url;
      }
      const client = new ApiClient;
      let response = await client.createReview(map.id, params);
      let json = await response.json();
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(closeCopyReviewDialog());
        dispatch(createReview(json));
        dispatch(openToast('Successfuly copy report!'));
      } else {
        dispatch(openToast(json.detail));
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CopyReviewDialog);

import { connect } from 'react-redux';
import EditReviewDialog from '../ui/EditReviewDialog';
import ApiClient from './ApiClient';
import createReview from '../actions/createReview';
import editReview from '../actions/editReview';
import closeEditReviewDialog from '../actions/closeEditReviewDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import fetchSpots from '../actions/fetchSpots';
import { uploadToStorage, deleteFromStorage, canvasToBlob } from './Utils';

const mapStateToProps = (state) => {
  return {
    dialogOpen: state.reviews.editReviewDialogOpen,
    selectedPlace: state.reviews.selectedPlace,
    currentReview: state.reviews.currentReview
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleClickCreateButton: async (mapId, params, canvas) => {
      dispatch(requestStart());
      let fileName;
      if (canvas) {
        let blob = await canvasToBlob(canvas);
        let response = await uploadToStorage(blob);
        params.image_url = response.imageUrl;
        fileName = response.fileName;
      }
      const client = new ApiClient;
      let response = await client.createReview(mapId, params);
      let json = await response.json();
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(closeEditReviewDialog());
        dispatch(createReview(json));
        dispatch(openToast('Successfuly created the report!'));

        let spotsResponse = await client.fetchSpots(json.map_id);
        let spots = await spotsResponse.json();
        dispatch(fetchSpots(spots));
      } else {
        dispatch(openToast(json.detail));
        if (fileName) {
          deleteFromStorage(fileName);
        }
      }
    },

    handleClickEditButton: async (oldReview, params, canvas) => {
      dispatch(requestStart());
      let fileName;
      if (canvas) {
        let blob = await canvasToBlob(canvas);
        let response = await uploadToStorage(blob);
        params.image_url = response.imageUrl;
        fileName = response.fileName;
      }
      if (!canvas && !oldReview.image) {
        params.image_url = '';
      }
      const client = new ApiClient;
      let response = await client.editReview(params);
      let json = await response.json();
      dispatch(requestFinish());
      if (response.ok) {
        if (oldReview.image && canvas && !oldReview.image.url.includes('amazonaws')) {
          deleteFromStorage(oldReview.image.file_name);
        }
        dispatch(closeEditReviewDialog());
        dispatch(editReview(json));
        dispatch(openToast('Successfuly updated the report!'));
        let spotsResponse = await client.fetchSpots(json.map_id);
        let spots = await spotsResponse.json();
        dispatch(fetchSpots(spots));
      } else {
        dispatch(openToast(json.detail));
        if (fileName) {
          deleteFromStorage(fileName);
        }
      }
    },

    handleRequestClose: () => {
      dispatch(closeEditReviewDialog());
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditReviewDialog);

import React from 'react';
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
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';
import requestMapCenter from '../actions/requestMapCenter';
import selectSpot from '../actions/selectSpot';
import { sleep, uploadToStorage, deleteFromStorage, canvasToBlob } from './Utils';
import I18n from './I18n';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import fetchPostableMaps from '../actions/fetchPostableMaps';

const mapStateToProps = state => {
  return {
    dialogOpen: state.reviews.editReviewDialogOpen,
    selectedPlace: state.reviews.selectedPlace,
    currentReview: state.reviews.targetReview,
    currentMap: state.mapDetail.currentMap,
    postableMaps: state.maps.postableMaps,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
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
      const client = new ApiClient();
      let response = await client.createReview(mapId, params);
      let json = await response.json();
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(closeEditReviewDialog());
        dispatch(openToast(I18n.t('create review success')));

        gtag('event', 'create', {
          'event_category': 'engagement',
          'event_label': 'review'
        });

        if (canvas) {
          // wait until thumbnail created on cloud function
          await sleep(5000);
        }
        dispatch(createReview(json));
        let spotsResponse = await client.fetchSpots(json.map.id);
        let spots = await spotsResponse.json();
        dispatch(fetchSpots(spots));

        dispatch(requestMapCenter(json.spot.lat, json.spot.lng));
        dispatch(selectSpot(json.spot));
      } else {
        dispatch(openToast(json.detail));
        if (fileName) {
          deleteFromStorage(fileName);
        }
      }
    },

    handleClickEditButton: async (
      oldReview,
      params,
      canvas,
      isImageDeleteRequest = false
    ) => {
      dispatch(requestStart());
      let fileName;
      if (canvas) {
        let blob = await canvasToBlob(canvas);
        let response = await uploadToStorage(blob);
        params.image_url = response.imageUrl;
        fileName = response.fileName;
      } else if (isImageDeleteRequest) {
        params.image_url = '';
      }
      const client = new ApiClient();
      let response = await client.editReview(params);
      let json = await response.json();
      dispatch(requestFinish());
      if (response.ok) {
        if (oldReview.image && canvas) {
          deleteFromStorage(oldReview.image.file_name);
        }
        dispatch(closeEditReviewDialog());
        dispatch(openToast(I18n.t('edit review success')));

        if (canvas) {
          // wait until thumbnail created on cloud function
          await sleep(5000);
        }
        dispatch(editReview(json));
        let spotsResponse = await client.fetchSpots(json.map.id);
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
    },

    handleSpotClick: () => {
      dispatch(openPlaceSelectDialog());
    },

    handleCreateMapButtonClick: () => {
      dispatch(closeEditReviewDialog());
      dispatch(openCreateMapDialog());
    },

    fetchPostableMaps: async () => {
      const client = new ApiClient();
      let response = await client.fetchPostableMaps();
      if (response.ok) {
        let maps = await response.json();
        dispatch(fetchPostableMaps(maps));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      }
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(EditReviewDialog));

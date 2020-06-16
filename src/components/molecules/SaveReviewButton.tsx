import React, { useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';

import Button from '@material-ui/core/Button';

import createReview from '../../actions/createReview';
import editReview from '../../actions/editReview';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import openToast from '../../actions/openToast';
import requestMapCenter from '../../actions/requestMapCenter';
import selectMapSpot from '../../actions/selectMapSpot';
import closeEditReviewDialog from '../../actions/closeEditReviewDialog';

import uploadToStorage from '../../utils/uploadToStorage';
import sleep from '../../utils/sleep';
import I18n from '../../utils/I18n';

import { ReviewsApi, NewReview } from '@yusuke-suzuki/qoodish-api-js-client';

const SaveReviewButton = props => {
  const {
    color,
    disabled,
    selectedPlace,
    images,
    comment,
    currentReview,
    targetMapId
  } = props;

  const dispatch = useDispatch();

  const handleSaveButtonClick = useCallback(() => {
    const params = {
      comment: comment,
      place_id: selectedPlace.placeId,
      images: []
    };

    if (currentReview) {
      Object.assign(params, {
        review_id: currentReview.id
      });
      handleClickEditButton(params, images);
    } else {
      Object.assign(params, {
        map_id: targetMapId
      });
      handleClickCreateButton(params, images);
    }
  }, [currentReview, targetMapId, comment, images, selectedPlace]);

  const handleClickCreateButton = useCallback(async (params, images) => {
    dispatch(requestStart());

    for (let image of images) {
      const url = new URL(image.src);

      if (url.protocol === 'data:') {
        const response = await uploadToStorage(image.src, 'images', 'data_url');
        params.images.push({ url: response.imageUrl });
      } else if (url.protocol === 'https:') {
        params.images.push({ url: image.dataset.url });
      }
    }

    const apiInstance = new ReviewsApi();
    const newReview = NewReview.constructFromObject(params);

    apiInstance.mapsMapIdReviewsPost(
      params.map_id,
      newReview,
      async (error, data, response) => {
        dispatch(requestFinish());

        if (response.ok) {
          dispatch(closeEditReviewDialog());
          dispatch(openToast(I18n.t('create review success')));

          gtag('event', 'create', {
            event_category: 'engagement',
            event_label: 'review'
          });

          if (images.length > 0) {
            // wait until thumbnail created on cloud function
            await sleep(3000);
          }
          const review = response.body;
          dispatch(createReview(review));
          dispatch(requestMapCenter(review.spot.lat, review.spot.lng));
          dispatch(selectMapSpot(review.spot));
        } else {
          dispatch(openToast(response.body.detail));
        }
      }
    );
  }, [dispatch]);

  const handleClickEditButton = useCallback(async (params, images) => {
    dispatch(requestStart());

    for (let image of images) {
      const url = new URL(image.src);

      if (url.protocol === 'data:') {
        const response = await uploadToStorage(image.src, 'images', 'data_url');
        params.images.push({ url: response.imageUrl });
      } else if (url.protocol === 'https:') {
        params.images.push({ url: image.dataset.url });
      }
    }

    const apiInstance = new ReviewsApi();
    const newReview = NewReview.constructFromObject(params);

    apiInstance.reviewsReviewIdPut(
      params.review_id,
      newReview,
      async (error, data, response) => {
        dispatch(requestFinish());

        if (response.ok) {
          dispatch(closeEditReviewDialog());
          dispatch(openToast(I18n.t('edit review success')));

          if (images.length > 0) {
            // wait until thumbnail created on cloud function
            await sleep(3000);
          }

          const review = response.body;
          dispatch(editReview(review));
          dispatch(requestMapCenter(review.spot.lat, review.spot.lng));
        } else {
          dispatch(openToast(response.body.detail));
        }
      }
    );
  }, [dispatch]);

  return (
    <Button
      variant="contained"
      onClick={handleSaveButtonClick}
      color={color}
      disabled={disabled}
      data-test="save-review-button"
    >
      {I18n.t('save')}
    </Button>
  );
};

export default React.memo(SaveReviewButton);

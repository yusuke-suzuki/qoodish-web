import React, { useEffect, useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import CircularProgress from '@material-ui/core/CircularProgress';
import ReviewCard from '../molecules/ReviewCard';
import NoContents from '../molecules/NoContents';

import I18n from '../../utils/I18n';
import openToast from '../../actions/openToast';
import selectReview from '../../actions/selectReview';
import updateMetadata from '../../actions/updateMetadata';

import { ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';

const styles = {
  progress: {
    textAlign: 'center',
    paddingTop: 20
  }
};

const ReviewCardContainer = props => {
  if (props.review) {
    return <ReviewCard currentReview={props.review} />;
  } else {
    return (
      <NoContents
        contentType="review"
        message={I18n.t('reports will see here')}
      />
    );
  }
};

const ReviewDetail = props => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentReview: state.reviewDetail.currentReview,
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentReview, currentUser } = useMappedState(mapState);
  const [loading, setLoading] = useState(true);

  const initReview = useCallback(async (mapId, reviewId) => {
    if (currentReview && currentReview.id == reviewId) {
      return;
    }

    setLoading(true);
    const apiInstance = new ReviewsApi();

    apiInstance.mapsMapIdReviewsReviewIdGet(
      mapId,
      reviewId,
      (error, data, response) => {
        setLoading(false);

        if (response.ok) {
          dispatch(selectReview(response.body));
        } else if (response.status == 401) {
          dispatch(openToast('Authenticate failed'));
        } else if (response.status == 404) {
          dispatch(openToast('Report not found.'));
        } else {
          dispatch(openToast('Failed to fetch Report.'));
        }
      }
    );
  });

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }

    if (!props.params.mapId || !props.params.reviewId) {
      return;
    }

    initReview(props.params.mapId, props.params.reviewId);
  }, [currentUser.uid, props.params.mapId, props.params.reviewId]);

  useEffect(() => {
    if (!currentReview) {
      return;
    }
    const metadata = {
      noindex: currentReview.map.private,
      title: `${currentReview.spot.name} - ${currentReview.map.name} | Qoodish`,
      keywords: `${currentReview.map.name}, ${currentReview.spot.name}, Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`,
      description: currentReview.comment,
      twitterCard: 'summary_large_image',
      image: currentReview.image
        ? currentReview.image.thumbnail_url_800
        : process.env.OGP_IMAGE_URL,
      url: `${process.env.ENDPOINT}/maps/${currentReview.map.id}/reports/${currentReview.id}`
    };
    dispatch(updateMetadata(metadata));
  }, [currentReview]);

  return (
    <div>
      {loading ? (
        <div style={styles.progress}>
          <CircularProgress />
        </div>
      ) : (
        <ReviewCardContainer review={currentReview} />
      )}
    </div>
  );
};

export default React.memo(ReviewDetail);

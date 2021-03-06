import React, { useEffect, useCallback, useState, useContext } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import ReviewCard from '../molecules/ReviewCard';
import NoContents from '../molecules/NoContents';

import openToast from '../../actions/openToast';
import selectReview from '../../actions/selectReview';
import updateMetadata from '../../actions/updateMetadata';

import { ApiClient, ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import SkeletonReviewCard from '../molecules/SkeletonReviewCard';
import I18n from '../../utils/I18n';
import { Link } from '@yusuke-suzuki/rize-router';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import AuthContext from '../../context/AuthContext';

const styles = {
  backButtonContainer: {
    marginTop: 16
  }
};

const ReviewCardContainer = React.memo(props => {
  const { review } = props;
  if (review) {
    return <ReviewCard currentReview={review} />;
  } else {
    return (
      <NoContents
        contentType="review"
        message={I18n.t('reports will see here')}
      />
    );
  }
});

const MapButton = React.memo(props => {
  const { currentReview } = props;
  return (
    <Button
      component={Link}
      to={`/maps/${currentReview.map.id}`}
      color="primary"
      startIcon={<KeyboardArrowLeftIcon />}
    >
      {I18n.t('back to map')}
    </Button>
  );
});

const ReviewDetail = props => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentReview: state.reviewDetail.currentReview,
      previousLocation: state.shared.previousLocation
    }),
    []
  );
  const { currentReview, previousLocation } = useMappedState(mapState);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useContext(AuthContext);

  const initReview = useCallback(
    async (mapId, reviewId) => {
      setLoading(true);
      const apiInstance = new ReviewsApi();
      const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
      firebaseAuth.apiKey = await currentUser.getIdToken();
      firebaseAuth.apiKeyPrefix = 'Bearer';

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
    },
    [currentReview, dispatch, currentUser]
  );

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }

    if (!props.params.mapId || !props.params.reviewId) {
      return;
    }

    if (
      currentReview &&
      previousLocation &&
      previousLocation.state &&
      previousLocation.state.modal
    ) {
      return;
    }

    initReview(props.params.mapId, props.params.reviewId);
  }, [currentUser, props.params.mapId, props.params.reviewId]);

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
      image:
        currentReview.images.length > 0
          ? currentReview.images[0].thumbnail_url_800
          : process.env.OGP_IMAGE_URL,
      url: `${process.env.ENDPOINT}/maps/${currentReview.map.id}/reports/${currentReview.id}`
    };
    dispatch(updateMetadata(metadata));
  }, [currentReview]);

  return (
    <div>
      {loading ? (
        <SkeletonReviewCard />
      ) : (
        <React.Fragment>
          <ReviewCardContainer review={currentReview} />
          <div style={styles.backButtonContainer}>
            {currentReview && <MapButton currentReview={currentReview} />}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default React.memo(ReviewDetail);

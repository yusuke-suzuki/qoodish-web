import React, { useEffect, useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import CircularProgress from '@material-ui/core/CircularProgress';
import ReviewCard from '../molecules/ReviewCard';
import NoContents from '../molecules/NoContents';
import Helmet from 'react-helmet';

import I18n from '../../utils/I18n';
import openToast from '../../actions/openToast';
import selectReview from '../../actions/selectReview';
import clearReviewState from '../../actions/clearReviewState';
import { ReviewsApi } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';

const styles = {
  progress: {
    textAlign: 'center',
    paddingTop: 20
  }
};

const ReviewHelmet = props => {
  const review = props.review;

  return (
    <Helmet
      title={`${review.spot.name} | Qoodish`}
      link={[
        {
          rel: 'canonical',
          href: `${process.env.ENDPOINT}/maps/${review.map.id}/${review.id}`
        }
      ]}
      meta={[
        review.map.private ? { name: 'robots', content: 'noindex' } : {},
        {
          name: 'title',
          content: `${review.spot.name} - ${review.map.name} | Qoodish`
        },
        {
          name: 'keywords',
          content: `${
            review.map.name
          }, Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`
        },
        { name: 'description', content: review.comment },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: `${review.spot.name} - ${review.map.name} | Qoodish`
        },
        { name: 'twitter:description', content: review.comment },
        {
          name: 'twitter:image',
          content: review.image ? review.image.url : process.env.SUBSTITUTE_URL
        },
        {
          property: 'og:title',
          content: `${review.spot.name} - ${review.map.name} | Qoodish`
        },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:url',
          content: `${process.env.ENDPOINT}/maps/${review.map.id}/${review.id}`
        },
        {
          property: 'og:image',
          content: review.image ? review.image.url : process.env.SUBSTITUTE_URL
        },
        {
          property: 'og:description',
          content: review.comment
        }
      ]}
    />
  );
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
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({ currentReview: state.reviewDetail.currentReview }),
    []
  );
  const { currentReview } = useMappedState(mapState);
  const [loading, setLoading] = useState(true);

  const initReview = useCallback(async () => {
    setLoading(true);
    await initializeApiClient();
    const apiInstance = new ReviewsApi();

    apiInstance.mapsMapIdReviewsReviewIdGet(
      props.params.primaryId,
      props.params.secondaryId,
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
    if (!currentReview) {
      initReview();
    }
    return () => {
      dispatch(clearReviewState());
    };
  }, []);

  useEffect(
    () => {
      if (currentReview) {
        gtag('config', process.env.GA_TRACKING_ID, {
          page_path: `/maps/${currentReview.map.id}/reports/${
            currentReview.id
          }`,
          page_title: `${currentReview.spot.name} - ${
            currentReview.map.name
          } | Qoodish`
        });
      }
    },
    [currentReview]
  );

  return (
    <div>
      {currentReview && <ReviewHelmet review={currentReview} />}
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

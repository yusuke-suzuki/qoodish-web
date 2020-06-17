import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import NoContents from '../molecules/NoContents';
import CreateResourceButton from '../molecules/CreateResourceButton';

import openToast from '../../actions/openToast';
import fetchReviews from '../../actions/fetchReviews';
import updateMetadata from '../../actions/updateMetadata';

import I18n from '../../utils/I18n';
import { ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import { Link } from '@yusuke-suzuki/rize-router';
import SkeletonReviewCards from '../organisms/SkeletonReviewCards';
import ReviewCards from '../organisms/ReviewCards';
import LoadMoreReviewsButton from '../molecules/LoadMoreReviewsButton';
import CreateReviewForm from '../molecules/CreateReviewForm';

const styles = {
  buttonContainer: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16
  },
  trendingReviews: {
    marginTop: 20
  }
};

const ReviewsContainer = React.memo(props => {
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  const { reviews } = props;

  return (
    <div>
      {currentUser.isAnonymous && (
        <Typography
          variant="h6"
          color="textSecondary"
          style={styles.trendingReviews}
        >
          {I18n.t('trending reviews')}
        </Typography>
      )}

      <ReviewCards reviews={reviews} />

      {currentUser.isAnonymous ? (
        <div style={styles.buttonContainer}>
          <Button component={Link} to="/discover" color="primary">
            {I18n.t('discover more')}
          </Button>
        </div>
      ) : (
        <div style={styles.buttonContainer}>
          <LoadMoreReviewsButton />
        </div>
      )}
    </div>
  );
});

const Timeline = () => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      currentReviews: state.timeline.currentReviews
    }),
    []
  );

  const { currentUser, currentReviews } = useMappedState(mapState);

  const [loading, setLoading] = useState(true);

  const refreshReviews = useCallback(async () => {
    setLoading(true);

    const apiInstance = new ReviewsApi();

    apiInstance.reviewsGet({}, (error, data, response) => {
      setLoading(false);

      if (response.ok) {
        dispatch(fetchReviews(response.body));
      } else if (response.status == 401) {
        dispatch(openToast(I18n.t('authentication error')));
      } else {
        dispatch(openToast(I18n.t('internal server error')));
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }

    refreshReviews();
  }, [currentUser.uid]);

  useEffect(() => {
    const metadata = {
      title: 'Qoodish',
      url: process.env.ENDPOINT
    };
    dispatch(updateMetadata(metadata));
  }, []);

  return (
    <div>
      <CreateReviewForm />

      {loading ? (
        <SkeletonReviewCards />
      ) : currentReviews.length > 0 ? (
        <ReviewsContainer reviews={currentReviews} />
      ) : (
        <NoContents
          contentType="review"
          action="create-review"
          secondaryAction="discover-reviews"
          message={I18n.t('reports will see here')}
        />
      )}

      {large && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(Timeline);

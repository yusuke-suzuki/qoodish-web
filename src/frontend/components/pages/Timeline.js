import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';

import ReviewCard from '../molecules/ReviewCard';
import NoContents from '../molecules/NoContents';
import CreateResourceButton from '../molecules/CreateResourceButton';

import openToast from '../../actions/openToast';
import fetchReviews from '../../actions/fetchReviews';
import fetchMoreReviews from '../../actions/fetchMoreReviews';
import openPlaceSelectDialog from '../../actions/openPlaceSelectDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import updateMetadata from '../../actions/updateMetadata';

import I18n from '../../utils/I18n';
import { ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import { Link } from '@yusuke-suzuki/rize-router';
import SkeletonReviewCard from '../molecules/SkeletonReviewCard';

const styles = {
  formCard: {
    cursor: 'pointer'
  },
  container: {
    display: 'inline-block',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%'
  },
  buttonContainer: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  cardContainerSmall: {
    marginTop: 16
  },
  cardContainerLarge: {
    marginTop: 20
  },
  trendingReviews: {
    marginTop: 20
  }
};

const FormAvatar = React.memo(() => {
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentUser } = useMappedState(mapState);

  if (!currentUser || currentUser.isAnonymous) {
    return (
      <Avatar>
        <PersonIcon />
      </Avatar>
    );
  } else {
    return <Avatar src={currentUser.thumbnail_url} alt={currentUser.name} />;
  }
});

const CreateReviewForm = React.memo(() => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentUser } = useMappedState(mapState);

  const handleCreateReviewClick = useCallback(() => {
    if (!currentUser || currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }
    dispatch(openPlaceSelectDialog());
  });

  return (
    <Card
      style={styles.formCard}
      onClick={handleCreateReviewClick}
      elevation={0}
    >
      <CardHeader
        avatar={<FormAvatar />}
        title={
          <Typography variant="body1" color="textSecondary">
            {I18n.t('share recent spot')}
          </Typography>
        }
      />
    </Card>
  );
});

const LoadMoreButton = React.memo(() => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      noMoreReviews: state.timeline.noMoreReviews,
      nextTimestamp: state.timeline.nextTimestamp
    }),
    []
  );

  const { noMoreReviews, nextTimestamp } = useMappedState(mapState);

  const [loading, setLoading] = useState(false);

  const loadMoreReviews = useCallback(async () => {
    setLoading(true);

    const apiInstance = new ReviewsApi();

    const opts = {
      nextTimestamp: nextTimestamp
    };
    apiInstance.reviewsGet(opts, (error, data, response) => {
      setLoading(false);

      if (response.ok) {
        dispatch(fetchMoreReviews(response.body));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else {
        dispatch(openToast('Failed to fetch reports.'));
      }
    });
  });

  if (loading) {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  } else {
    return noMoreReviews ? null : (
      <div style={styles.buttonContainer}>
        <Button
          onClick={loadMoreReviews}
          style={large ? styles.raisedButtonLarge : styles.raisedButtonSmall}
          color="primary"
        >
          {I18n.t('load more')}
        </Button>
      </div>
    );
  }
});

const ReviewsContainer = React.memo(props => {
  const large = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  const { currentReviews } = props;

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
      {currentReviews.map(review => (
        <div
          key={review.id}
          style={large ? styles.cardContainerLarge : styles.cardContainerSmall}
        >
          <ReviewCard currentReview={review} />
        </div>
      ))}
      {currentUser.isAnonymous ? (
        <div style={styles.buttonContainer}>
          <Button component={Link} to="/discover" color="primary">
            {I18n.t('discover more')}
          </Button>
        </div>
      ) : (
        <LoadMoreButton />
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
        dispatch(openToast('Authenticate failed'));
      } else {
        dispatch(openToast('Failed to fetch reports.'));
      }
    });
  });

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
      <div style={styles.container}>
        {loading ? (
          Array.from(new Array(2)).map((v, i) => (
            <div
              style={
                large ? styles.cardContainerLarge : styles.cardContainerSmall
              }
            >
              <SkeletonReviewCard />
            </div>
          ))
        ) : currentReviews.length > 0 ? (
          <ReviewsContainer currentReviews={currentReviews} />
        ) : (
          <NoContents
            contentType="review"
            action="create-review"
            secondaryAction="discover-reviews"
            message={I18n.t('reports will see here')}
          />
        )}
      </div>
      {large && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(Timeline);

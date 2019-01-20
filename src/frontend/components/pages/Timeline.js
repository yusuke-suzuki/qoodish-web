import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

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

import ApiClient from '../../utils/ApiClient';
import openToast from '../../actions/openToast';
import fetchReviews from '../../actions/fetchReviews';
import fetchMoreReviews from '../../actions/fetchMoreReviews';
import openPlaceSelectDialog from '../../actions/openPlaceSelectDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';

const styles = {
  rootLarge: {
    margin: '94px auto 200px',
    maxWidth: 700
  },
  rootSmall: {
    margin: '56px auto 56px',
    width: '100%'
  },
  formCardLarge: {
    marginTop: 84,
    cursor: 'pointer'
  },
  formCardSmall: {
    marginTop: 72,
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
  }
};

const FormAvatar = () => {
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
};

const CreateReviewForm = () => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');
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
      style={large ? styles.formCardLarge : styles.formCardSmall}
      onClick={handleCreateReviewClick}
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
};

const LoadMoreButton = () => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      noMoreReviews: state.reviews.noMoreReviews,
      nextTimestamp: state.reviews.nextTimestamp
    }),
    []
  );

  const { noMoreReviews, nextTimestamp } = useMappedState(mapState);

  const [loading, setLoading] = useState(true);

  const loadMoreReviews = useCallback(async () => {
    setLoading(true);
    const client = new ApiClient();
    let response = await client.fetchReviews(nextTimestamp);
    let reviews = await response.json();
    setLoading(false);
    if (response.ok) {
      dispatch(fetchMoreReviews(reviews));
    } else if (response.status == 401) {
      dispatch(openToast('Authenticate failed'));
    } else {
      dispatch(openToast('Failed to fetch reports.'));
    }
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
          variant="contained"
          onClick={loadMoreReviews}
          style={large ? styles.raisedButtonLarge : styles.raisedButtonSmall}
        >
          {I18n.t('load more')}
        </Button>
      </div>
    );
  }
};

const ReviewsContainer = () => {
  const large = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      currentReviews: state.reviews.currentReviews
    }),
    []
  );

  const { currentReviews } = useMappedState(mapState);

  if (currentReviews.length > 0) {
    return (
      <div>
        {currentReviews.map(review => (
          <div
            key={review.id}
            style={
              large ? styles.cardContainerLarge : styles.cardContainerSmall
            }
          >
            <ReviewCard currentReview={review} />
          </div>
        ))}
        <LoadMoreButton />
      </div>
    );
  } else {
    return (
      <NoContents
        contentType="review"
        action="create-review"
        secondaryAction="discover-reviews"
        message={I18n.t('reports will see here')}
      />
    );
  }
};

const Timeline = () => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  const [loading, setLoading] = useState(false);

  const refreshReviews = useCallback(async () => {
    if (!currentUser || currentUser.isAnonymous) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const client = new ApiClient();
    let response = await client.fetchReviews();
    let reviews = await response.json();
    setLoading(false);
    if (response.ok) {
      dispatch(fetchReviews(reviews));
    } else if (response.status == 401) {
      dispatch(openToast('Authenticate failed'));
    } else {
      dispatch(openToast('Failed to fetch reports.'));
    }
  });

  useEffect(() => {
    refreshReviews();

    gtag('config', process.env.GA_TRACKING_ID, {
      page_path: '/',
      page_title: `${I18n.t('home')} | Qoodish`
    });
  }, []);

  return (
    <div style={large ? styles.rootLarge : styles.rootSmall}>
      <CreateReviewForm />
      <div style={styles.container}>
        {loading ? (
          <div style={styles.progress}>
            <CircularProgress />
          </div>
        ) : (
          <ReviewsContainer />
        )}
      </div>
      {large && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(Timeline);

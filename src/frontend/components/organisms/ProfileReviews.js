import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import CircularProgress from '@material-ui/core/CircularProgress';

import LoadMoreUserReviewsButton from '../molecules/LoadMoreUserReviewsButton';
import ReviewGridList from './ReviewGridList';
import NoContents from '../molecules/NoContents';

import fetchUserReviews from '../../actions/fetchUserReviews';
import I18n from '../../utils/I18n';
import { ReviewsApi } from 'qoodish_api';

const styles = {
  reviewsLarge: {
    marginTop: 20,
    paddingBottom: 20
  },
  reviewsSmall: {
    marginTop: 8,
    paddingBottom: 16
  },
  noReviewsLarge: {
    paddingTop: 20
  },
  noReviewsSmall: {
    paddingTop: 8
  },
  progress: {
    textAlign: 'center',
    padding: 20,
    marginTop: 20
  }
};

const ProfileReviews = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      currentReviews: state.profile.currentReviews,
      location: state.shared.currentLocation
    }),
    []
  );

  const { currentUser, currentReviews, location } = useMappedState(mapState);

  const [loading, setLoading] = useState(true);

  const initReviews = useCallback(async () => {
    if (
      location &&
      location.pathname === '/profile' &&
      currentUser.isAnonymous
    ) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const userId =
      props.params && props.params.primaryId
        ? props.params.primaryId
        : currentUser.uid;

    const apiInstance = new ReviewsApi();

    apiInstance.usersUserIdReviewsGet(userId, {}, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        dispatch(fetchUserReviews(response.body));
      }
    });
  });

  useEffect(
    () => {
      if (!currentUser || !currentUser.uid) {
        return;
      }
      initReviews();
    },
    [currentUser.uid]
  );

  if (loading) {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  } else {
    return currentReviews.length > 0 ? (
      <div style={large ? styles.reviewsLarge : styles.reviewsSmall}>
        <ReviewGridList reviews={currentReviews} />
        <LoadMoreUserReviewsButton {...props} />
      </div>
    ) : (
      <div style={large ? styles.noReviewsLarge : styles.noReviewsSmall}>
        <NoContents
          contentType="review"
          action="create-review"
          message={I18n.t('reports will see here')}
        />
      </div>
    );
  }
};

export default React.memo(ProfileReviews);

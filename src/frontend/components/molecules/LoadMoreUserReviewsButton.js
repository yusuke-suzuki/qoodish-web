import React, { useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import fetchMoreUserReviews from '../../actions/fetchMoreUserReviews';

import I18n from '../../utils/I18n';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ReviewsApi } from 'qoodish_api';

const styles = {
  buttonLarge: {
    textAlign: 'center',
    padding: 20
  },
  buttonSmall: {
    textAlign: 'center',
    marginTop: 16,
    paddingBottom: 8
  },
  progress: {
    textAlign: 'center',
    padding: 20,
    marginTop: 20
  }
};

const LoadMoreUserReviewsButton = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      noMoreReviews: state.profile.noMoreReviews,
      nextTimestamp: state.profile.nextTimestamp,
      location: state.shared.currentLocation
    }),
    []
  );

  const { noMoreReviews, nextTimestamp, location } = useMappedState(mapState);

  const [loading, setLoading] = useState(false);

  const handleClickLoadMoreButton = useCallback(async () => {
    setLoading(true);
    let userId =
      location && location.pathname === '/profile'
        ? props.currentUser.uid
        : props.params.primaryId;

    const apiInstance = new ReviewsApi();
    const opts = {
      nextTimestamp: nextTimestamp
    };
    apiInstance.usersUserIdReviewsGet(userId, opts, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        dispatch(fetchMoreUserReviews(response.body));
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
      <div style={large ? styles.buttonLarge : styles.buttonSmall}>
        <Button color="primary" onClick={handleClickLoadMoreButton}>
          {I18n.t('load more')}
        </Button>
      </div>
    );
  }
};
export default React.memo(LoadMoreUserReviewsButton);

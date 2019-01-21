import React, { useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import fetchMoreUserReviews from '../../actions/fetchMoreUserReviews';

import I18n from '../../utils/I18n';
import ApiClient from '../../utils/ApiClient';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

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
      pathname: state.shared.currentLocation
    }),
    []
  );

  const { noMoreReviews, nextTimestamp, pathname } = useMappedState(mapState);

  const [loading, setLoading] = useState(false);

  const handleClickLoadMoreButton = useCallback(async () => {
    setLoading(true);
    const client = new ApiClient();
    let userId =
      pathname === '/profile' ? undefined : props.match.params.userId;
    let response = await client.fetchUserReviews(userId, nextTimestamp);
    let reviews = await response.json();
    dispatch(fetchMoreUserReviews(reviews));
    setLoading(false);
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
        <Button variant="contained" onClick={handleClickLoadMoreButton}>
          {I18n.t('load more')}
        </Button>
      </div>
    );
  }
};
export default React.memo(LoadMoreUserReviewsButton);

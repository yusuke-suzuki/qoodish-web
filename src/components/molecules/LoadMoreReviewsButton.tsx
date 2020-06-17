import React, { useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import fetchMoreReviews from '../../actions/fetchMoreReviews';
import openToast from '../../actions/openToast';
import { ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import I18n from '../../utils/I18n';

const styles = {
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  }
};

const LoadMoreButton = () => {
  const dispatch = useDispatch();

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
  }, [dispatch, nextTimestamp]);

  if (loading) {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  } else {
    return noMoreReviews ? null : (
      <Button onClick={loadMoreReviews} color="primary">
        {I18n.t('load more')}
      </Button>
    );
  }
};

export default React.memo(LoadMoreButton);

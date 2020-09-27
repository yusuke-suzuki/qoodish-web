import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import LoadMoreUserReviewsButton from '../molecules/LoadMoreUserReviewsButton';
import ReviewGridList from './ReviewGridList';
import NoContents from '../molecules/NoContents';

import fetchUserReviews from '../../actions/fetchUserReviews';
import I18n from '../../utils/I18n';
import { ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import ReviewImageTile from './ReviewImageTile';
import Skeleton from '@material-ui/lab/Skeleton';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '@material-ui/core';

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
  skeleton: {
    width: '100%',
    height: '100%',
    textAlign: 'center'
  }
};

const ProfileReviews = props => {
  const { params } = props;
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const { currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentReviews: state.profile.currentReviews,
      location: state.shared.currentLocation
    }),
    []
  );

  const { currentReviews, location } = useMappedState(mapState);

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

    const userId = params && params.userId ? params.userId : currentUser.uid;

    const apiInstance = new ReviewsApi();

    apiInstance.usersUserIdReviewsGet(userId, {}, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        dispatch(fetchUserReviews(response.body));
      }
    });
  }, [dispatch, params, currentUser, location]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initReviews();
  }, [currentUser]);

  if (!loading && currentReviews.length < 1) {
    return (
      <div style={smUp ? styles.noReviewsLarge : styles.noReviewsSmall}>
        <NoContents
          contentType="review"
          action="create-review"
          message={I18n.t('reports will see here')}
        />
      </div>
    );
  }

  return (
    <div style={smUp ? styles.reviewsLarge : styles.reviewsSmall}>
      {loading ? (
        <ReviewGridList
          cols={smUp ? 4 : 3}
          spacing={smUp ? 20 : 4}
          cellHeight={smUp ? 165 : 115}
        >
          {Array.from(new Array(smUp ? 8 : 6)).map((v, i) => (
            <Skeleton key={i} variant="rect" style={styles.skeleton} />
          ))}
        </ReviewGridList>
      ) : (
        <React.Fragment>
          <ReviewGridList
            cols={smUp ? 4 : 3}
            spacing={smUp ? 20 : 4}
            cellHeight="auto"
          >
            {currentReviews.map(review => (
              <ReviewImageTile review={review} key={review.id} />
            ))}
          </ReviewGridList>
          <LoadMoreUserReviewsButton {...props} />
        </React.Fragment>
      )}
    </div>
  );
};

export default React.memo(ProfileReviews);

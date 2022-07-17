import React, { memo, useCallback, useContext, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import fetchMoreUserReviews from '../../actions/fetchMoreUserReviews';
import { ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import {
  Button,
  CircularProgress,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(() =>
  createStyles({
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
  })
);

type Props = {
  userId: string;
};

export default memo(function LoadMoreUserReviewsButton(props: Props) {
  const { userId } = props;

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const dispatch = useDispatch();
  const classes = useStyles();
  const { I18n } = useLocale();

  const mapState = useCallback(
    state => ({
      noMoreReviews: state.profile.noMoreReviews,
      nextTimestamp: state.profile.nextTimestamp
    }),
    []
  );

  const { noMoreReviews, nextTimestamp } = useMappedState(mapState);

  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  const handleClickLoadMoreButton = useCallback(async () => {
    setLoading(true);
    const uid = userId ? userId : currentUser.uid;

    const apiInstance = new ReviewsApi();
    const opts = {
      nextTimestamp: nextTimestamp
    };
    apiInstance.usersUserIdReviewsGet(uid, opts, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        dispatch(fetchMoreUserReviews(response.body));
      }
    });
  }, [dispatch, currentUser, userId, nextTimestamp]);

  if (loading) {
    return (
      <div className={classes.progress}>
        <CircularProgress />
      </div>
    );
  } else {
    return noMoreReviews ? null : (
      <div className={smUp ? classes.buttonLarge : classes.buttonSmall}>
        <Button color="primary" onClick={handleClickLoadMoreButton}>
          {I18n.t('load more')}
        </Button>
      </div>
    );
  }
});

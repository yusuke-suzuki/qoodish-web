import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import LoadMoreUserReviewsButton from '../molecules/LoadMoreUserReviewsButton';
import ReviewGridList from './ReviewGridList';
import NoContents from '../molecules/NoContents';

import fetchUserReviews from '../../actions/fetchUserReviews';
import { ApiClient, ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import ReviewImageTile from './ReviewImageTile';
import Skeleton from '@material-ui/lab/Skeleton';
import AuthContext from '../../context/AuthContext';
import {
  useTheme,
  useMediaQuery,
  makeStyles,
  Theme,
  createStyles
} from '@material-ui/core';
import { useRouter } from 'next/router';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    reviews: {
      marginTop: theme.spacing(1),
      paddingBottom: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        marginTop: 20,
        paddingBottom: 20
      }
    },
    noReviews: {
      paddingTop: theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        paddingTop: 20
      }
    },
    skeleton: {
      width: '100%',
      height: '100%',
      textAlign: 'center'
    }
  })
);

type Props = {
  userId: string;
};

const ProfileReviews = (props: Props) => {
  const { userId } = props;
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const { currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const router = useRouter();
  const { I18n } = useLocale();

  const classes = useStyles();

  const mapState = useCallback(
    state => ({
      currentReviews: state.profile.currentReviews
    }),
    []
  );

  const { currentReviews } = useMappedState(mapState);

  const [loading, setLoading] = useState(true);

  const initReviews = useCallback(async () => {
    if (router.pathname === '/profile' && currentUser.isAnonymous) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const uid = userId ? userId : currentUser.uid;

    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
    const apiInstance = new ReviewsApi();

    apiInstance.usersUserIdReviewsGet(uid, {}, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        dispatch(fetchUserReviews(response.body));
      }
    });
  }, [dispatch, userId, currentUser, router]);

  useEffect(() => {
    if (currentUser && userId) {
      initReviews();
    }
  }, [currentUser, userId]);

  if (!loading && currentReviews.length < 1) {
    return (
      <div className={classes.noReviews}>
        <NoContents
          contentType="review"
          action="create-review"
          message={I18n.t('reports will see here')}
        />
      </div>
    );
  }

  return (
    <div className={classes.reviews}>
      {loading ? (
        <ReviewGridList
          cols={smUp ? 4 : 3}
          spacing={smUp ? 10 : 4}
          cellHeight={smUp ? 165 : 115}
        >
          {Array.from(new Array(smUp ? 8 : 6)).map((v, i) => (
            <Skeleton key={i} variant="rect" className={classes.skeleton} />
          ))}
        </ReviewGridList>
      ) : (
        <>
          <ReviewGridList
            cols={smUp ? 4 : 3}
            spacing={smUp ? 10 : 4}
            cellHeight="auto"
          >
            {currentReviews.map(review => (
              <ReviewImageTile review={review} key={review.id} />
            ))}
          </ReviewGridList>
          <LoadMoreUserReviewsButton userId={userId} />
        </>
      )}
    </div>
  );
};

export default React.memo(ProfileReviews);

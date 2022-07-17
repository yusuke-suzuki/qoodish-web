import React, { useCallback, useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import NoContents from '../components/molecules/NoContents';
import CreateResourceButton from '../components/molecules/CreateResourceButton';

import openToast from '../actions/openToast';
import fetchReviews from '../actions/fetchReviews';

import { ApiClient, ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import Link from 'next/link';
import SkeletonReviewCards from '../components/organisms/SkeletonReviewCards';
import ReviewCards from '../components/organisms/ReviewCards';
import LoadMoreReviewsButton from '../components/molecules/LoadMoreReviewsButton';
import CreateReviewForm from '../components/molecules/CreateReviewForm';
import { createStyles, Grid, makeStyles, useTheme } from '@material-ui/core';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import { useLocale } from '../hooks/useLocale';
import { useRouter } from 'next/router';

const useStyles = makeStyles(theme =>
  createStyles({
    buttonGroup: {
      position: 'fixed',
      zIndex: 1,
      bottom: theme.spacing(4),
      right: theme.spacing(4)
    },
    buttonContainer: {
      textAlign: 'center',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    },
    trendingReviews: {
      marginTop: 20
    }
  })
);

const Timeline = () => {
  const { I18n } = useLocale();
  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const classes = useStyles();
  const router = useRouter();

  const mapState = useCallback(
    state => ({
      currentReviews: state.timeline.currentReviews
    }),
    []
  );

  const { currentReviews } = useMappedState(mapState);
  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);

  const refreshReviews = useCallback(async () => {
    setLoading(true);

    const apiInstance = new ReviewsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

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
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }

    refreshReviews();
  }, [currentUser]);

  const title = 'Qoodish';
  const description = I18n.t('meta description');
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;

  return (
    <Layout hideBottomNav={false} fullWidth={false}>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}`}
          hrefLang="x-default"
        />

        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip"
        />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}`}
        />
        <meta
          property="og:image"
          content={process.env.NEXT_PUBLIC_OGP_IMAGE_URL}
        />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      <CreateReviewForm />

      {loading || !currentUser ? (
        <SkeletonReviewCards />
      ) : currentReviews.length > 0 ? (
        <>
          {currentUser.isAnonymous && (
            <Typography
              variant="h6"
              color="textSecondary"
              className={classes.trendingReviews}
            >
              {I18n.t('trending reviews')}
            </Typography>
          )}

          <ReviewCards reviews={currentReviews} />

          {currentUser.isAnonymous ? (
            <div className={classes.buttonContainer}>
              <Link href="/discover" passHref>
                <Button color="primary">{I18n.t('discover more')}</Button>
              </Link>
            </div>
          ) : (
            <div className={classes.buttonContainer}>
              <LoadMoreReviewsButton />
            </div>
          )}
        </>
      ) : (
        <NoContents
          contentType="review"
          action="create-review"
          secondaryAction="discover-reviews"
          message={I18n.t('reports will see here')}
        />
      )}

      {smUp && (
        <div className={classes.buttonGroup}>
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <CreateResourceButton />
            </Grid>
          </Grid>
        </div>
      )}
    </Layout>
  );
};

export default React.memo(Timeline);

import React, { memo, useCallback, useContext, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import ExploreIcon from '@material-ui/icons/Explore';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import Typography from '@material-ui/core/Typography';

import I18n from '../../utils/I18n';

import fetchActiveMaps from '../../actions/fetchActiveMaps';
import fetchRecentMaps from '../../actions/fetchRecentMaps';

import { ApiClient, MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import { useTheme, useMediaQuery, makeStyles, Grid } from '@material-ui/core';
import MapCollection from '../../components/organisms/MapCollection';
import PickUpMap from '../../components/organisms/PickUpMap';
import RecentReviews from '../../components/organisms/RecentReviews';
import TrendingMaps from '../../components/organisms/TrendingMaps';
import TrendingSpots from '../../components/organisms/TrendingSpots';
import CreateResourceButton from '../../components/molecules/CreateResourceButton';
import Layout from '../../components/Layout';
import Head from 'next/head';

const useStyles = makeStyles(theme => ({
  buttonGroup: {
    position: 'fixed',
    zIndex: 1,
    bottom: theme.spacing(4),
    right: theme.spacing(4)
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: theme.spacing(5)
  },
  rankingContainer: {
    marginTop: theme.spacing(5),
    marginBottom: 20
  },
  mapsContainer: {
    marginBottom: theme.spacing(5)
  },
  gridHeader: {
    width: '100%',
    display: 'inline-flex',
    marginBottom: 15
  },
  headerIcon: {
    marginRight: 10
  }
}));

export default memo(function Discover() {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const classes = useStyles();

  const { currentUser } = useContext(AuthContext);

  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      activeMaps: state.discover.activeMaps,
      recentMaps: state.discover.recentMaps
    }),
    []
  );
  const { activeMaps, recentMaps } = useMappedState(mapState);

  const initActiveMaps = useCallback(async () => {
    const apiInstance = new MapsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
    const opts = {
      active: true
    };

    apiInstance.mapsGet(opts, (error, data, response) => {
      if (response.ok) {
        const maps = response.body;
        dispatch(fetchActiveMaps(maps));
      } else {
        console.log(error);
      }
    });
  }, [dispatch, currentUser]);

  const initRecentMaps = useCallback(async () => {
    const apiInstance = new MapsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
    const opts = {
      recent: true
    };

    apiInstance.mapsGet(opts, (error, data, response) => {
      if (response.ok) {
        const maps = response.body;
        dispatch(fetchRecentMaps(maps));
      } else {
        console.log(error);
      }
    });
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initActiveMaps();
    initRecentMaps();
  }, [currentUser]);

  return (
    <Layout hideBottomNav={false} fullWidth={false}>
      <Head>
        <title>{`${I18n.t('discover')} | Qoodish`}</title>
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/discover`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/discover?hl=en`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/discover?hl=ja`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/discover`}
          hrefLang="x-default"
        />
        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip"
        />
        <meta name="title" content={`${I18n.t('discover')} | Qoodish`} />
        <meta name="description" content={I18n.t('meta description')} />
        <meta property="og:title" content={`${I18n.t('discover')} | Qoodish`} />
        <meta property="og:description" content={I18n.t('meta description')} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}/discover`}
        />
        <meta property="og:image" content={process.env.NEXT_PUBLIC_OGP_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content={process.env.NEXT_PUBLIC_OGP_IMAGE}
        />
        <meta
          name="twitter:title"
          content={`${I18n.t('discover')} | Qoodish`}
        />
        <meta name="twitter:description" content={I18n.t('meta description')} />
        <meta property="og:locale" content={I18n.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      <div className={classes.container}>
        <Typography
          variant="subtitle1"
          gutterBottom
          color="textSecondary"
          className={classes.gridHeader}
        >
          <ExploreIcon className={classes.headerIcon} /> {I18n.t('pick up')}
        </Typography>
        <br />
        <PickUpMap />
      </div>

      <div className={classes.container}>
        <Typography
          variant="subtitle1"
          gutterBottom
          color="textSecondary"
          className={classes.gridHeader}
        >
          <FiberNewIcon className={classes.headerIcon} />{' '}
          {I18n.t('recent reports')}
        </Typography>
        <br />
        <RecentReviews />
      </div>

      <div className={classes.container}>
        <Typography
          variant="subtitle1"
          gutterBottom
          color="textSecondary"
          className={classes.gridHeader}
        >
          <WhatshotIcon className={classes.headerIcon} />{' '}
          {I18n.t('active maps')}
        </Typography>
        <MapCollection maps={activeMaps} horizontal />
      </div>

      <div className={classes.container}>
        <Typography
          variant="subtitle1"
          gutterBottom
          color="textSecondary"
          className={classes.gridHeader}
        >
          <FiberNewIcon className={classes.headerIcon} />{' '}
          {I18n.t('recent maps')}
        </Typography>
        <MapCollection maps={recentMaps} horizontal />
      </div>

      {!mdUp && (
        <div>
          <div className={classes.rankingContainer}>
            <TrendingMaps />
          </div>

          <div className={classes.rankingContainer}>
            <TrendingSpots />
          </div>
        </div>
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
});

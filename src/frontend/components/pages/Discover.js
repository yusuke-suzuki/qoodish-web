import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import CircularProgress from '@material-ui/core/CircularProgress';
import ExploreIcon from '@material-ui/icons/Explore';
import PlaceIcon from '@material-ui/icons/Place';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import GradeIcon from '@material-ui/icons/Grade';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import Typography from '@material-ui/core/Typography';

import MapCollection from '../organisms/MapCollection';
import NoContents from '../molecules/NoContents';
import RecentReviews from '../organisms/RecentReviews';
import CreateResourceButton from '../molecules/CreateResourceButton';
import PickUpMap from '../organisms/PickUpMap';
import TrendingMaps from '../organisms/TrendingMaps';
import TrendingSpots from '../organisms/TrendingSpots';

import I18n from '../../utils/I18n';

import Helmet from 'react-helmet';

import ApiClient from '../../utils/ApiClient';
import fetchActiveMaps from '../../actions/fetchActiveMaps';
import fetchRecentMaps from '../../actions/fetchRecentMaps';

const styles = {
  rootLarge: {
    maxWidth: 900,
    margin: '94px auto 20px'
  },
  rootSmall: {
    margin: '76px auto 64px'
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 40,
    marginBottom: 20
  },
  listContainerLarge: {
    display: 'flex'
  },
  listContainerSmall: {},
  rankingContainerLarge: {
    marginTop: 40,
    marginBottom: 20,
    width: '50%'
  },
  rankingContainerSmall: {
    marginTop: 40,
    marginBottom: 20
  },
  mapsContainer: {
    marginTop: 40,
    marginBottom: 20
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  gridHeader: {
    width: '100%',
    display: 'inline-flex',
    marginBottom: 15
  },
  headerIcon: {
    marginLeft: 10,
    marginRight: 10
  }
};

const DiscoverHelmet = () => {
  return (
    <Helmet
      title={`${I18n.t('discover')} | Qoodish`}
      link={[{ rel: 'canonical', href: `${process.env.ENDPOINT}/discover` }]}
      meta={[
        { name: 'title', content: `${I18n.t('discover')} | Qoodish` },
        { property: 'og:title', content: `${I18n.t('discover')} | Qoodish` },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:url',
          content: `${process.env.ENDPOINT}/discover`
        }
      ]}
    />
  );
};

const DiscoverProgress = () => {
  return (
    <div style={styles.progress}>
      <CircularProgress />
    </div>
  );
};

const MapContainer = props => {
  const large = useMediaQuery('(min-width: 600px)');
  if (props.maps.length > 0) {
    return <MapCollection maps={props.maps} horizontal={!large} />;
  } else {
    return (
      <NoContents contentType="map" message={I18n.t('maps will see here')} />
    );
  }
};

const Discover = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      activeMaps: state.discover.activeMaps,
      recentMaps: state.discover.recentMaps
    }),
    []
  );
  const { activeMaps, recentMaps } = useMappedState(mapState);

  const [loadingActiveMaps, setLoadingActiveMaps] = useState(true);
  const [loadingRecentMaps, setLoadingRecentMaps] = useState(true);

  const initActiveMaps = useCallback(async () => {
    setLoadingActiveMaps(true);
    const client = new ApiClient();
    let response = await client.fetchActiveMaps();
    let maps = await response.json();
    dispatch(fetchActiveMaps(maps));
    setLoadingActiveMaps(false);
  });

  const initRecentMaps = useCallback(async () => {
    setLoadingRecentMaps(true);
    const client = new ApiClient();
    let response = await client.fetchRecentMaps();
    let maps = await response.json();
    dispatch(fetchRecentMaps(maps));
    setLoadingRecentMaps(false);
  });

  useEffect(() => {
    initActiveMaps();
    initRecentMaps();

    gtag('config', process.env.GA_TRACKING_ID, {
      page_path: '/discover',
      page_title: `${I18n.t('discover')} | Qoodish`
    });
  }, []);

  return (
    <div style={large ? styles.rootLarge : styles.rootSmall}>
      <DiscoverHelmet />

      <div style={styles.container}>
        <Typography
          variant="subtitle1"
          gutterBottom
          color="textSecondary"
          style={styles.gridHeader}
        >
          <ExploreIcon style={styles.headerIcon} /> {I18n.t('pick up')}
        </Typography>
        <br />
        <PickUpMap />
      </div>

      <div style={styles.container}>
        <Typography
          variant="subtitle1"
          gutterBottom
          color="textSecondary"
          style={styles.gridHeader}
        >
          <FiberNewIcon style={styles.headerIcon} /> {I18n.t('recent reports')}
        </Typography>
        <br />
        <RecentReviews />
      </div>

      <div style={styles.mapsContainer}>
        <Typography
          variant="subtitle1"
          gutterBottom
          color="textSecondary"
          style={styles.gridHeader}
        >
          <WhatshotIcon style={styles.headerIcon} /> {I18n.t('active maps')}
        </Typography>
        {loadingActiveMaps ? (
          <DiscoverProgress />
        ) : (
          <MapContainer maps={activeMaps} />
        )}
      </div>

      <div style={styles.mapsContainer}>
        <Typography
          variant="subtitle1"
          gutterBottom
          color="textSecondary"
          style={styles.gridHeader}
        >
          <FiberNewIcon style={styles.headerIcon} /> {I18n.t('recent maps')}
        </Typography>
        {loadingRecentMaps ? (
          <DiscoverProgress />
        ) : (
          <MapContainer maps={recentMaps} />
        )}
      </div>

      <div
        style={large ? styles.listContainerLarge : styles.listContainerSmall}
      >
        <div
          style={
            large ? styles.rankingContainerLarge : styles.rankingContainerSmall
          }
        >
          <Typography
            variant="subtitle1"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <GradeIcon style={styles.headerIcon} /> {I18n.t('trending maps')}
          </Typography>
          <br />
          <TrendingMaps />
        </div>

        <div
          style={
            large ? styles.rankingContainerLarge : styles.rankingContainerSmall
          }
        >
          <Typography
            variant="subtitle1"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <PlaceIcon style={styles.headerIcon} /> {I18n.t('trending spots')}
          </Typography>
          <br />
          <TrendingSpots />
        </div>
      </div>
      {large && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(Discover);

import React, { useCallback, useContext, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import ExploreIcon from '@material-ui/icons/Explore';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import Typography from '@material-ui/core/Typography';

import RecentReviews from '../organisms/RecentReviews';
import CreateResourceButton from '../molecules/CreateResourceButton';
import PickUpMap from '../organisms/PickUpMap';
import TrendingMaps from '../organisms/TrendingMaps';
import TrendingSpots from '../organisms/TrendingSpots';

import I18n from '../../utils/I18n';

import fetchActiveMaps from '../../actions/fetchActiveMaps';
import fetchRecentMaps from '../../actions/fetchRecentMaps';
import updateMetadata from '../../actions/updateMetadata';

import { ApiClient, MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import SkeletonMapCollection from '../organisms/SkeletonMapCollection';
import MapCollection from '../organisms/MapCollection';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '@material-ui/core';

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 40
  },
  rankingContainer: {
    marginTop: 40,
    marginBottom: 20
  },
  mapsContainer: {
    marginBottom: 40
  },
  gridHeader: {
    width: '100%',
    display: 'inline-flex',
    marginBottom: 15
  },
  headerIcon: {
    marginRight: 10
  }
};

const MapContainer = React.memo(props => {
  const { maps } = props;

  return maps.length > 0 ? (
    <MapCollection maps={maps} horizontal />
  ) : (
    <SkeletonMapCollection horizontal />
  );
});

const Discover = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

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

  useEffect(() => {
    dispatch(
      updateMetadata({
        title: `${I18n.t('discover')} | Qoodish`,
        url: `${process.env.ENDPOINT}/discover`
      })
    );
  }, []);

  return (
    <div>
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

      <div style={styles.container}>
        <Typography
          variant="subtitle1"
          gutterBottom
          color="textSecondary"
          style={styles.gridHeader}
        >
          <WhatshotIcon style={styles.headerIcon} /> {I18n.t('active maps')}
        </Typography>
        <MapContainer maps={activeMaps} />
      </div>

      <div style={styles.container}>
        <Typography
          variant="subtitle1"
          gutterBottom
          color="textSecondary"
          style={styles.gridHeader}
        >
          <FiberNewIcon style={styles.headerIcon} /> {I18n.t('recent maps')}
        </Typography>
        <MapContainer maps={recentMaps} />
      </div>

      {!mdUp && (
        <div>
          <div style={styles.rankingContainer}>
            <TrendingMaps />
          </div>

          <div style={styles.rankingContainer}>
            <TrendingSpots />
          </div>
        </div>
      )}

      {smUp && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(Discover);

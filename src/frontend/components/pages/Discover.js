import React, { useCallback, useEffect } from 'react';
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

import { MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import SkeletonMapCollection from '../organisms/SkeletonMapCollection';
import MapCollection from '../organisms/MapCollection';

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
    marginRight: 10
  }
};

const MapContainer = props => {
  const { maps } = props;

  return (
    <div>
      {maps.length > 0 ? (
        <MapCollection maps={maps} horizontal />
      ) : (
        <SkeletonMapCollection horizontal />
      )}
    </div>
  );
};

const Discover = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const mdUp = useMediaQuery('(min-width: 960px)');
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      activeMaps: state.discover.activeMaps,
      recentMaps: state.discover.recentMaps
    }),
    []
  );
  const { currentUser, activeMaps, recentMaps } = useMappedState(mapState);

  const initActiveMaps = useCallback(async () => {
    const apiInstance = new MapsApi();
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
  });

  const initRecentMaps = useCallback(async () => {
    const apiInstance = new MapsApi();
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
  });

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initActiveMaps();
    initRecentMaps();
  }, [currentUser.uid]);

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

      <div style={styles.mapsContainer}>
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

      <div style={styles.mapsContainer}>
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

      {large && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(Discover);

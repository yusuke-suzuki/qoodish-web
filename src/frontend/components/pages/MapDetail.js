import React, { useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useHistory } from '@yusuke-suzuki/rize-router';

import selectMap from '../../actions/selectMap';
import openToast from '../../actions/openToast';
import clearMapState from '../../actions/clearMapState';
import fetchMapReviews from '../../actions/fetchMapReviews';
import fetchCollaborators from '../../actions/fetchCollaborators';
import updateMetadata from '../../actions/updateMetadata';

import I18n from '../../utils/I18n';

import {
  MapsApi,
  CollaboratorsApi,
  ReviewsApi
} from '@yusuke-suzuki/qoodish-api-js-client';

const GMap = React.lazy(() =>
  import(/* webpackChunkName: "gmap" */ '../organisms/GMap')
);
const MapSummary = React.lazy(() =>
  import(/* webpackChunkName: "map_summary" */ '../organisms/MapSummary')
);
const DeleteMapDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "delete_map_dialog" */ '../organisms/DeleteMapDialog'
  )
);
const InviteTargetDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "invite_target_dialog" */ '../organisms/InviteTargetDialog'
  )
);
const MapSpotDrawer = React.lazy(() =>
  import(/* webpackChunkName: "map_spot_drawer" */ '../organisms/MapSpotDrawer')
);
const CreateResourceButton = React.lazy(() =>
  import(
    /* webpackChunkName: "create_resource_button" */ '../molecules/CreateResourceButton'
  )
);
const LocationButton = React.lazy(() =>
  import(
    /* webpackChunkName: "location_button" */ '../molecules/LocationButton'
  )
);
const SpotHorizontalList = React.lazy(() =>
  import(
    /* webpackChunkName: "spot_horizontal_list" */ '../organisms/SpotHorizontalList'
  )
);

import { ThemeProvider } from '@material-ui/styles';
import useTheme from '@material-ui/styles/useTheme';

import Drawer from '@material-ui/core/Drawer';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Fab from '@material-ui/core/Fab';
import switchSummary from '../../actions/switchSummary';

const styles = {
  containerLarge: {},
  containerMd: {
    position: 'fixed',
    top: 64,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'block',
    width: '100%'
  },
  containerSmall: {
    position: 'fixed',
    top: 56,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'block',
    width: '100%'
  },
  drawerPaperLarge: {
    zIndex: 1000
  },
  drawerPaperSmall: {
    height: '100%',
    width: '100%'
  },
  mapButtonsLarge: {
    right: 0,
    bottom: 0
  },
  mapButtonsSmall: {
    position: 'relative',
    right: 0,
    bottom: 124
  },
  switchSummaryContainerLarge: {
    textAlign: 'center',
    width: '100%',
    position: 'absolute',
    zIndex: 1,
    top: 78
  },
  switchSummaryContainerSmall: {
    textAlign: 'center',
    width: '100%',
    position: 'absolute',
    zIndex: 1,
    top: 70
  },
  infoIcon: {
    marginRight: 6
  }
};

const MapSummaryDrawer = props => {
  const lgUp = useMediaQuery('(min-width: 1280px)');
  const mapState = useCallback(
    state => ({
      mapSummaryOpen: state.mapDetail.mapSummaryOpen
    }),
    []
  );
  const { mapSummaryOpen } = useMappedState(mapState);

  return (
    <Drawer
      variant={lgUp ? 'persistent' : 'temporary'}
      anchor={lgUp ? 'left' : 'right'}
      open={lgUp ? true : mapSummaryOpen}
      PaperProps={{
        style: lgUp ? styles.drawerPaperLarge : styles.drawerPaperSmall
      }}
    >
      <React.Suspense fallback={null}>
        <MapSummary
          mapId={props.params.mapId}
          dialogMode={lgUp ? false : true}
        />
      </React.Suspense>
    </Drawer>
  );
};

const MapButtons = React.memo(props => {
  const lgUp = useMediaQuery('(min-width: 1280px)');
  const currentMap = props.currentMap;

  return (
    <div style={lgUp ? styles.mapButtonsLarge : styles.mapButtonsSmall}>
      <React.Suspense fallback={null}>
        <CreateResourceButton
          buttonForMap
          disabled={
            !(currentMap && currentMap.postable && currentMap.following)
          }
        />
        <LocationButton />
      </React.Suspense>
    </div>
  );
});

const SwitchSummaryButton = React.memo(() => {
  const smUp = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();
  const theme = useTheme();

  const handleSummaryButtonClick = useCallback(() => {
    dispatch(switchSummary());
  });

  return (
    <ThemeProvider theme={theme}>
      <div
        style={
          smUp
            ? styles.switchSummaryContainerLarge
            : styles.switchSummaryContainerSmall
        }
      >
        <Fab
          variant="extended"
          size="small"
          color="primary"
          onClick={handleSummaryButtonClick}
        >
          <InfoOutlinedIcon style={styles.infoIcon} />
          {I18n.t('summary')}
        </Fab>
      </div>
    </ThemeProvider>
  );
});

const MapDetail = props => {
  const smUp = useMediaQuery('(min-width: 600px)');
  const lgUp = useMediaQuery('(min-width: 1280px)');

  const dispatch = useDispatch();
  const history = useHistory();

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      currentMap: state.mapDetail.currentMap
    }),
    []
  );
  const { currentUser, currentMap } = useMappedState(mapState);

  const initMap = useCallback(async () => {
    const apiInstance = new MapsApi();

    apiInstance.mapsMapIdGet(props.params.mapId, (error, data, response) => {
      if (response.ok) {
        dispatch(selectMap(response.body));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else if (response.status == 404) {
        history.push('');
        dispatch(openToast(I18n.t('map not found')));
      } else {
        dispatch(openToast('Failed to fetch Map.'));
      }
    });
  });

  const initMapReviews = useCallback(async () => {
    const apiInstance = new ReviewsApi();

    apiInstance.mapsMapIdReviewsGet(
      props.params.mapId,
      {},
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchMapReviews(response.body));
        }
      }
    );
  });

  const initFollowers = useCallback(async () => {
    const apiInstance = new CollaboratorsApi();

    apiInstance.mapsMapIdCollaboratorsGet(
      props.params.mapId,
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchCollaborators(response.body));
        } else {
          console.log('API called successfully. Returned data: ' + data);
        }
      }
    );
  });

  const refreshMap = useCallback(() => {
    initMap();
    initMapReviews();
    initFollowers();
  });

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    refreshMap();

    return () => {
      dispatch(clearMapState());
    };
  }, [currentUser.uid]);

  useEffect(() => {
    if (!currentMap) {
      return;
    }
    const metadata = {
      noindex: currentMap.private,
      title: `${currentMap.name} | Qoodish`,
      keywords: `${currentMap.name}, Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`,
      description: currentMap.description,
      twitterCard: 'summary_large_image',
      image: currentMap.image_url,
      url: `${process.env.ENDPOINT}/maps/${currentMap.id}`
    };
    dispatch(updateMetadata(metadata));
  }, [currentMap]);

  return (
    <div>
      {lgUp ? (
        <div>
          <MapSummaryDrawer {...props} />
          <React.Suspense fallback={null}>
            <GMap />
          </React.Suspense>
          <MapButtons currentMap={currentMap} />
        </div>
      ) : (
        <div>
          <SwitchSummaryButton />
          <div style={smUp ? styles.containerMd : styles.containerSmall}>
            <React.Suspense fallback={null}>
              <GMap />
            </React.Suspense>
            <MapButtons currentMap={currentMap} />
          </div>
          <React.Suspense fallback={null}>
            <SpotHorizontalList />
          </React.Suspense>
          <MapSummaryDrawer {...props} />
        </div>
      )}
      <React.Suspense fallback={null}>
        <DeleteMapDialog mapId={props.params.mapId} />
        <InviteTargetDialog mapId={props.params.mapId} />
        {!lgUp && <MapSpotDrawer mapId={props.params.mapId} />}
      </React.Suspense>
    </div>
  );
};

export default React.memo(MapDetail);

import React, { useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import selectMap from '../../actions/selectMap';
import openToast from '../../actions/openToast';
import clearMapState from '../../actions/clearMapState';
import fetchMapReviews from '../../actions/fetchMapReviews';
import fetchCollaborators from '../../actions/fetchCollaborators';

import I18n from '../../utils/I18n';

import { MapsApi, CollaboratorsApi, ReviewsApi } from 'qoodish_api';

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

import Helmet from 'react-helmet';
import Drawer from '@material-ui/core/Drawer';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Fab from '@material-ui/core/Fab';
import switchSummary from '../../actions/switchSummary';

const styles = {
  containerLarge: {},
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
  switchSummaryContainer: {
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

const dispatchGtag = map => {
  gtag('config', process.env.GA_TRACKING_ID, {
    page_path: `/maps/${map.id}`,
    page_title: `${map.name} | Qoodish`
  });
};

const MapDetailHelmet = props => {
  const map = props.map;

  return (
    <Helmet
      title={`${map.name} | Qoodish`}
      link={[
        { rel: 'canonical', href: `${process.env.ENDPOINT}/maps/${map.id}` }
      ]}
      meta={[
        map.private ? { name: 'robots', content: 'noindex' } : {},
        { name: 'title', content: `${map.name} | Qoodish` },
        {
          name: 'keywords',
          content: `${
            map.name
          }, Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`
        },
        { name: 'description', content: map.description },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${map.name} | Qoodish` },
        { name: 'twitter:description', content: map.description },
        { name: 'twitter:image', content: map.image_url },
        { property: 'og:title', content: `${map.name} | Qoodish` },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:url',
          content: `${process.env.ENDPOINT}/maps/${map.id}`
        },
        { property: 'og:image', content: map.image_url },
        {
          property: 'og:description',
          content: map.description
        }
      ]}
    />
  );
};

const MapSummaryDrawer = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      mapSummaryOpen: state.mapDetail.mapSummaryOpen
    }),
    []
  );
  const { mapSummaryOpen } = useMappedState(mapState);

  return (
    <Drawer
      variant={large ? 'persistent' : 'temporary'}
      anchor={large ? 'left' : 'right'}
      open={large ? true : mapSummaryOpen}
      PaperProps={{
        style: large ? styles.drawerPaperLarge : styles.drawerPaperSmall
      }}
    >
      <React.Suspense fallback={null}>
        <MapSummary
          mapId={props.params.primaryId}
          dialogMode={large ? false : true}
        />
      </React.Suspense>
    </Drawer>
  );
};

const MapButtons = React.memo(props => {
  const large = useMediaQuery('(min-width: 600px)');
  const currentMap = props.currentMap;

  return (
    <div style={large ? styles.mapButtonsLarge : styles.mapButtonsSmall}>
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
  const dispatch = useDispatch();

  const handleSummaryButtonClick = useCallback(() => {
    dispatch(switchSummary());
  });

  return (
    <div style={styles.switchSummaryContainer}>
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
  );
});

const MapDetail = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      currentMap: state.mapDetail.currentMap,
      history: state.shared.history
    }),
    []
  );
  const { currentUser, currentMap, history } = useMappedState(mapState);

  const initMap = useCallback(async () => {
    const apiInstance = new MapsApi();

    apiInstance.mapsMapIdGet(
      props.params.primaryId,
      (error, data, response) => {
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
      }
    );
  });

  const initMapReviews = useCallback(async () => {
    const apiInstance = new ReviewsApi();

    apiInstance.mapsMapIdReviewsGet(
      props.params.primaryId,
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
      props.params.primaryId,
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchCollaborators(response.body));
        } else {
          console.log('API called successfully. Returned data: ' + data);
        }
      }
    );
  });

  useEffect(() => {
    if (!currentMap) {
      return;
    }
    dispatchGtag(currentMap);
  }, [currentMap]);

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
  }, [currentUser.uid, props.params.primaryId]);

  return (
    <div>
      {currentMap && <MapDetailHelmet map={currentMap} />}
      {large ? (
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
          <div style={large ? styles.containerLarge : styles.containerSmall}>
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
        <DeleteMapDialog mapId={props.params.primaryId} />
        <InviteTargetDialog mapId={props.params.primaryId} />
        {!large && <MapSpotDrawer mapId={props.params.primaryId} />}
      </React.Suspense>
    </div>
  );
};

export default React.memo(MapDetail);

import React, { useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import selectMap from '../../actions/selectMap';
import openToast from '../../actions/openToast';
import requestCurrentPosition from '../../actions/requestCurrentPosition';
import requestMapCenter from '../../actions/requestMapCenter';
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
  import(/* webpackChunkName: "delete_map_dialog" */ '../organisms/DeleteMapDialog')
);
const InviteTargetDialog = React.lazy(() =>
  import(/* webpackChunkName: "invite_target_dialog" */ '../organisms/InviteTargetDialog')
);
const MapSpotCard = React.lazy(() =>
  import(/* webpackChunkName: "map_spot_card" */ '../organisms/MapSpotCard')
);
const CreateResourceButton = React.lazy(() =>
  import(/* webpackChunkName: "create_resource_button" */ '../molecules/CreateResourceButton')
);
const LocationButton = React.lazy(() =>
  import(/* webpackChunkName: "location_button" */ '../molecules/LocationButton')
);
const SpotHorizontalList = React.lazy(() =>
  import(/* webpackChunkName: "spot_horizontal_list" */ '../organisms/SpotHorizontalList')
);

import Helmet from 'react-helmet';
import Drawer from '@material-ui/core/Drawer';
import initializeApiClient from '../../utils/initializeApiClient';

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
    height: '100%'
  },
  mapButtonsLarge: {
    right: 0,
    bottom: 0
  },
  mapButtonsSmall: {
    position: 'relative',
    right: 0,
    bottom: 124
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
      anchor={large ? 'left' : 'bottom'}
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

const MapDetail = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentMap: state.mapDetail.currentMap,
      history: state.shared.history
    }),
    []
  );
  const { currentMap, history } = useMappedState(mapState);

  const initMap = useCallback(async () => {
    await initializeApiClient();

    const apiInstance = new MapsApi();

    apiInstance.mapsMapIdGet(
      props.params.primaryId,
      (error, data, response) => {
        if (response.ok) {
          const map = response.body;
          dispatch(selectMap(map));
          dispatchGtag(map);

          if (map.base.place_id) {
            dispatch(requestMapCenter(map.base.lat, map.base.lng));
          } else {
            dispatch(requestCurrentPosition());
          }
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
    await initializeApiClient();
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
    await initializeApiClient();
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

  const refreshMap = useCallback(() => {
    initMap();
    initMapReviews();
    initFollowers();
  });

  useEffect(
    () => {
      refreshMap();
      return () => {
        dispatch(clearMapState());
      };
    },
    [props.params.primaryId]
  );

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
        <MapSpotCard mapId={props.params.primaryId} />
      </React.Suspense>
    </div>
  );
};

export default React.memo(MapDetail);

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import loadGoogleMapsApi from 'load-google-maps-api';

import openSpotCard from '../../actions/openSpotCard';
import selectMapSpot from '../../actions/selectMapSpot';
import requestCurrentPosition from '../../actions/requestCurrentPosition';
import requestMapCenter from '../../actions/requestMapCenter';

const CurrentPositionIcon = React.lazy(() =>
  import(
    /* webpackChunkName: "current_position_icon" */ '../molecules/CurrentPositionIcon'
  )
);
const SpotMarker = React.lazy(() =>
  import(/* webpackChunkName: "spot_marker" */ '../molecules/SpotMarker')
);

import OverlayView from '../molecules/OverlayView';
import I18n from '../../utils/I18n';
import { SpotsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import fetchSpots from '../../actions/fetchSpots';
import Popover from '@material-ui/core/Popover';
import SpotInfoWindow from '../molecules/SpotInfoWindow';

import { ThemeProvider } from '@material-ui/styles';
import useTheme from '@material-ui/styles/useTheme';
import sleep from '../../utils/sleep';
import clearMapSpotState from '../../actions/clearMapSpotState';

const styles = {
  mapWrapperLarge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 380,
    marginTop: 64
  },
  mapWrapperMd: {
    height: '100%'
  },
  mapWrapperSmall: {
    height: '100%'
  },
  mapLarge: {
    height: '100%',
    width: '100%'
  },
  mapSmall: {
    height: '100%',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  }
};

const GMap = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const smUp = useMediaQuery('(min-width: 600px)');
  const mdUp = useMediaQuery('(min-width: 960px)');
  const lgUp = useMediaQuery('(min-width: 1280px)');

  const [gMap, setGMap] = useState(undefined);
  const [googleMapsApi, setGoogleMapsApi] = useState(undefined);

  const mapState = useCallback(
    state => ({
      center: state.gMap.center,
      zoom: state.gMap.zoom,
      spots: state.gMap.spots,
      currentPosition: state.gMap.currentPosition,
      currentUser: state.app.currentUser,
      mapReviews: state.mapSummary.mapReviews,
      currentMap: state.mapSummary.currentMap
    }),
    []
  );
  const {
    center,
    zoom,
    spots,
    currentPosition,
    currentUser,
    mapReviews,
    currentMap
  } = useMappedState(mapState);

  const refreshSpots = useCallback(async () => {
    const apiInstance = new SpotsApi();

    apiInstance.mapsMapIdSpotsGet(currentMap.id, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchSpots(response.body));
      }
    });
  });

  useEffect(() => {
    if (!gMap) {
      return;
    }
    gMap.setCenter({
      lat: parseFloat(center.lat),
      lng: parseFloat(center.lng)
    });
    gMap.setZoom(zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (currentMap) {
      refreshSpots();
    }
  }, [mapReviews, currentMap]);

  const initGoogleMaps = useCallback(async () => {
    const options = {
      key: process.env.GOOGLE_MAP_API_KEY,
      v: 3
    };
    const googleMapsApi = await loadGoogleMapsApi(options);

    const map = new googleMapsApi.Map(document.querySelector('#map'), {
      center: {
        lat: parseFloat(center.lat),
        lng: parseFloat(center.lng)
      },
      zoom: zoom,
      zoomControlOptions: {
        position: googleMapsApi.ControlPosition.RIGHT_TOP,
        style: googleMapsApi.ZoomControlStyle.SMALL
      },
      streetViewControl: true,
      streetViewControlOptions: {
        position: mdUp
          ? googleMapsApi.ControlPosition.RIGHT_TOP
          : googleMapsApi.ControlPosition.LEFT_TOP
      },
      scaleControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: 'greedy'
    });

    setGMap(map);
    setGoogleMapsApi(googleMapsApi);
  });

  useEffect(() => {
    initGoogleMaps();
  }, []);

  const [anchorEl, setAnchorEl] = useState(undefined);
  const [windowOpen, setWindowOpen] = useState(false);

  useEffect(() => {
    if (!googleMapsApi || !currentPosition.lat || !gMap) {
      return;
    }
    new googleMapsApi.Marker({
      position: {
        lat: parseFloat(currentPosition.lat),
        lng: parseFloat(currentPosition.lng)
      },
      icon: {
        path: googleMapsApi.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#0088ff',
        fillOpacity: 0.8,
        strokeColor: '#0088ff',
        strokeOpacity: 0.2
      },
      map: gMap,
      title: I18n.t('you are hear')
    });
  }, [currentPosition]);

  const isGoogleMapsApiReady = useMemo(() => {
    if (gMap && googleMapsApi) {
      return true;
    } else {
      return false;
    }
  }, [gMap, googleMapsApi]);

  const initCenter = useCallback(async () => {
    await sleep(2000);
    if (currentMap.base.place_id) {
      dispatch(requestMapCenter(currentMap.base.lat, currentMap.base.lng));
    } else {
      dispatch(requestCurrentPosition());
    }
  });

  useEffect(() => {
    if (!currentMap || !isGoogleMapsApiReady) {
      return;
    }
    initCenter();
  }, [currentMap]);

  const onSpotMarkerClick = useCallback(async (e, spot) => {
    dispatch(selectMapSpot(spot));

    if (mdUp) {
      setAnchorEl(e.currentTarget);
      setWindowOpen(true);
    } else {
      dispatch(openSpotCard());
    }
  });

  const clearSpot = useCallback(() => {
    dispatch(clearMapSpotState());
  }, [dispatch]);

  return (
    <div
      style={
        lgUp
          ? styles.mapWrapperLarge
          : smUp
          ? styles.mapWrapperMd
          : styles.mapWrapperSmall
      }
    >
      <div id="map" style={lgUp ? styles.mapLarge : styles.mapSmall} />
      <Popover
        id="spot-info-window"
        anchorEl={anchorEl}
        open={windowOpen}
        onClose={() => setWindowOpen(false)}
        onExited={clearSpot}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <SpotInfoWindow />
      </Popover>
      {isGoogleMapsApiReady &&
        spots.map(spot => (
          <OverlayView
            key={spot.place_id}
            position={
              new googleMapsApi.LatLng(
                parseFloat(spot.lat),
                parseFloat(spot.lng)
              )
            }
            googleMapsApi={googleMapsApi}
            gMap={gMap}
          >
            <ThemeProvider theme={theme}>
              <React.Suspense fallback={null}>
                <SpotMarker
                  spot={spot}
                  onClick={e => onSpotMarkerClick(e, spot)}
                  large={mdUp}
                  aria-label="Info window"
                  aria-owns={windowOpen ? 'spot-info-window' : null}
                  aria-haspopup="true"
                />
              </React.Suspense>
            </ThemeProvider>
          </OverlayView>
        ))}

      {isGoogleMapsApiReady && currentPosition.lat && (
        <OverlayView
          position={
            new googleMapsApi.LatLng(
              parseFloat(currentPosition.lat),
              parseFloat(currentPosition.lng)
            )
          }
          googleMapsApi={googleMapsApi}
          gMap={gMap}
        >
          <React.Suspense fallback={null}>
            <CurrentPositionIcon currentUser={currentUser} large={mdUp} />
          </React.Suspense>
        </OverlayView>
      )}
    </div>
  );
};

export default React.memo(GMap);

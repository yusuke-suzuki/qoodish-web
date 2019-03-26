import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import loadGoogleMapsApi from 'load-google-maps-api';

import openSpotCard from '../../actions/openSpotCard';
import selectSpot from '../../actions/selectSpot';

const CurrentPositionIcon = React.lazy(() =>
  import(/* webpackChunkName: "current_position_icon" */ '../molecules/CurrentPositionIcon')
);
const SpotMarker = React.lazy(() =>
  import(/* webpackChunkName: "spot_marker" */ '../molecules/SpotMarker')
);

import OverlayView from '../molecules/OverlayView';
import I18n from '../../utils/I18n';
import initializeApiClient from '../../utils/initializeApiClient';
import { SpotsApi } from 'qoodish_api';
import fetchSpots from '../../actions/fetchSpots';
import Popover from '@material-ui/core/Popover';
import SpotInfoWindow from '../molecules/SpotInfoWindow';

const styles = {
  mapWrapperLarge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 380,
    marginTop: 64
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
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');

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
    await initializeApiClient();
    const apiInstance = new SpotsApi();

    apiInstance.mapsMapIdSpotsGet(currentMap.id, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchSpots(response.body));
      }
    });
  });

  useEffect(
    () => {
      if (!gMap) {
        return;
      }
      gMap.setCenter({
        lat: parseFloat(center.lat),
        lng: parseFloat(center.lng)
      });
      gMap.setZoom(zoom);
    },
    [center, zoom]
  );

  useEffect(
    () => {
      if (currentMap) {
        refreshSpots();
      }
    },
    [mapReviews, currentMap]
  );

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
        position: googleMapsApi.ControlPosition.RIGHT_TOP
      },
      scaleControl: true,
      mapTypeControl: false,
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

  useEffect(
    () => {
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
    },
    [currentPosition]
  );

  const isGoogleMapsApiReady = useMemo(
    () => {
      if (gMap && googleMapsApi) {
        return true;
      } else {
        return false;
      }
    },
    [gMap, googleMapsApi]
  );

  const onSpotMarkerClick = useCallback(async (e, spot) => {
    dispatch(selectSpot(spot));

    if (large) {
      setAnchorEl(e.currentTarget);
      setWindowOpen(true);
    } else {
      dispatch(openSpotCard());
    }
  });

  return (
    <div style={large ? styles.mapWrapperLarge : styles.mapWrapperSmall}>
      <div id="map" style={large ? styles.mapLarge : styles.mapSmall} />
      <Popover
        id="spot-info-window"
        anchorEl={anchorEl}
        open={windowOpen}
        onClose={() => setWindowOpen(false)}
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
            <React.Suspense fallback={null}>
              <SpotMarker
                spot={spot}
                onClick={e => onSpotMarkerClick(e, spot)}
                large={large}
                aria-label="Info window"
                aria-owns={windowOpen ? 'spot-info-window' : null}
                aria-haspopup="true"
              />
            </React.Suspense>
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
            <CurrentPositionIcon currentUser={currentUser} large={large} />
          </React.Suspense>
        </OverlayView>
      )}
    </div>
  );
};

export default React.memo(GMap);

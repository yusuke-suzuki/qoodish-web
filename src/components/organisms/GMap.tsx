import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import loadGoogleMapsApi from 'load-google-maps-api';

import requestCurrentPosition from '../../actions/requestCurrentPosition';
import requestMapCenter from '../../actions/requestMapCenter';

import sleep from '../../utils/sleep';
import GoogleMapsContext from '../../GoogleMapsContext';

import CurrentPositionMarker from '../molecules/CurrentPositionMarker';
import CurrentPositionIcon from '../molecules/CurrentPositionIcon';
import SpotMarkers from './SpotMarkers';

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
      currentMap: state.mapSummary.currentMap
    }),
    []
  );
  const { center, zoom, currentMap } = useMappedState(mapState);

  const initCenter = useCallback(async () => {
    await sleep(2000);

    if (currentMap.base.place_id) {
      dispatch(requestMapCenter(currentMap.base.lat, currentMap.base.lng));
    } else {
      dispatch(requestCurrentPosition());
    }
  }, [dispatch, currentMap]);

  const initGoogleMapsApi = useCallback(async () => {
    const options = {
      key: process.env.GOOGLE_MAP_API_KEY,
      v: 3
    };
    const api = await loadGoogleMapsApi(options);
    setGoogleMapsApi(api);
  }, []);

  const initGoogleMaps = useCallback(async () => {
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
  }, [googleMapsApi, center]);

  useEffect(() => {
    if (!currentMap || !gMap || !googleMapsApi) {
      return;
    }
    initCenter();
  }, [currentMap]);

  useEffect(() => {
    if (!gMap) {
      return;
    }
    gMap.setCenter({
      lat: parseFloat(center.lat),
      lng: parseFloat(center.lng)
    });
    gMap.setZoom(zoom);
  }, [center, zoom, gMap]);

  useEffect(() => {
    if (!googleMapsApi) {
      return;
    }
    initGoogleMaps();
  }, [googleMapsApi]);

  useEffect(() => {
    initGoogleMapsApi();
  }, []);

  return (
    <GoogleMapsContext.Provider
      value={{
        googleMapsApi: googleMapsApi,
        gMap: gMap
      }}
    >
      <SpotMarkers />
      <CurrentPositionMarker />
      <CurrentPositionIcon />

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
      </div>
    </GoogleMapsContext.Provider>
  );
};

export default React.memo(GMap);

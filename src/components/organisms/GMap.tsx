import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import requestCurrentPosition from '../../actions/requestCurrentPosition';
import requestMapCenter from '../../actions/requestMapCenter';

import sleep from '../../utils/sleep';
import GoogleMapsContext from '../../context/GoogleMapsContext';

import CurrentPositionMarker from '../molecules/CurrentPositionMarker';
import CurrentPositionIcon from '../molecules/CurrentPositionIcon';
import SpotMarkers from './SpotMarkers';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mapWrapper: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      marginTop: 56,
      [theme.breakpoints.up('sm')]: {
        marginTop: 64
      },
      [theme.breakpoints.up('lg')]: {
        marginLeft: 380
      }
    },
    map: {
      height: '100%'
    }
  })
);

const GMap = () => {
  const [googleMap, setGoogleMap] = useState<google.maps.Map>(null);
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentMap: state.mapSummary.currentMap,
      center: state.gMap.center,
      zoom: state.gMap.zoom
    }),
    []
  );
  const { currentMap, center, zoom } = useMappedState(mapState);

  const initCenter = useCallback(async () => {
    await sleep(2000);

    if (currentMap.base) {
      dispatch(requestMapCenter(currentMap.base.lat, currentMap.base.lng));
    } else {
      dispatch(requestCurrentPosition());
    }
  }, [dispatch, currentMap]);

  const initGoogleMaps = useCallback(() => {
    const mapOptions = {
      center: center,
      zoom: zoom,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP,
        style: google.maps.ZoomControlStyle.SMALL
      },
      streetViewControl: true,
      streetViewControlOptions: {
        position: mdUp
          ? google.maps.ControlPosition.RIGHT_TOP
          : google.maps.ControlPosition.LEFT_TOP
      },
      scaleControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: 'greedy' as google.maps.GestureHandlingOptions
    };

    const map = new google.maps.Map(document.querySelector('#map'), mapOptions);
    setGoogleMap(map);
  }, [center, zoom]);

  useEffect(() => {
    if (!googleMap) {
      return;
    }
    googleMap.setCenter({
      lat: center.lat,
      lng: center.lng
    });
    googleMap.setZoom(zoom);
  }, [center, zoom, googleMap]);

  useEffect(() => {
    if (!currentMap || !googleMap) {
      return;
    }
    initCenter();
  }, [currentMap]);

  useEffect(() => {
    initGoogleMaps();
  }, []);

  const classes = useStyles();

  return (
    <div className={classes.mapWrapper}>
      <div id="map" className={classes.map} />

      <GoogleMapsContext.Provider
        value={{
          googleMap: googleMap
        }}
      >
        <SpotMarkers />
        <CurrentPositionMarker />
        <CurrentPositionIcon />
      </GoogleMapsContext.Provider>
    </div>
  );
};

export default React.memo(GMap);

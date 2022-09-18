import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { useMappedState } from 'redux-react-hook';

import GoogleMapsContext from '../../context/GoogleMapsContext';

import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';
import { LoaderStatus } from '@googlemaps/js-api-loader';

const useStyles = makeStyles({
  map: {
    height: '100%'
  }
});

type Props = {
  children?: ReactNode;
};

const GoogleMaps = (props: Props) => {
  const { children } = props;
  const [googleMap, setGoogleMap] = useState<google.maps.Map>(null);
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const { status } = useGoogleMapsApi();

  const mapState = useCallback(
    state => ({
      currentMap: state.mapSummary.currentMap,
      currentReview: state.reviews.currentReview,
      reviewDialogOpen: state.reviews.reviewDialogOpen,
      spotCardOpen: state.spotCard.spotCardOpen,
      currentSpot: state.spotCard.currentSpot
    }),
    []
  );
  const {
    currentMap,
    currentReview,
    reviewDialogOpen,
    spotCardOpen,
    currentSpot
  } = useMappedState(mapState);

  const initCenter = useCallback(() => {
    if (currentMap.base) {
      googleMap.setCenter(
        new google.maps.LatLng(
          currentMap.base.lat as number,
          currentMap.base.lng as number
        )
      );
    }
  }, [currentMap, googleMap]);

  const setReviewLocation = useCallback(() => {
    googleMap.setCenter(
      new google.maps.LatLng(
        currentReview.spot.lat as number,
        currentReview.spot.lng as number
      )
    );
  }, [currentReview, googleMap]);

  const setSpotLocation = useCallback(() => {
    googleMap.setCenter(
      new google.maps.LatLng(
        currentSpot.lat as number,
        currentSpot.lng as number
      )
    );
  }, [currentSpot, googleMap]);

  const initGoogleMaps = useCallback(() => {
    const mapOptions = {
      center: {
        lat: 35.710063,
        lng: 139.8107
      },
      zoom: 17,
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
  }, []);

  useEffect(() => {
    if (currentReview && reviewDialogOpen && googleMap) {
      setReviewLocation();
    }
  }, [currentReview, reviewDialogOpen, googleMap]);

  useEffect(() => {
    if (currentSpot && spotCardOpen && googleMap) {
      setSpotLocation();
    }
  }, [currentSpot, spotCardOpen, googleMap]);

  useEffect(() => {
    if (currentMap && googleMap) {
      initCenter();
    }
  }, [currentMap, googleMap]);

  useEffect(() => {
    if (status !== LoaderStatus.SUCCESS) {
      return;
    }

    initGoogleMaps();
  }, [status]);

  const classes = useStyles();

  return (
    <>
      <div id="map" className={classes.map} />

      <GoogleMapsContext.Provider
        value={{
          googleMap: googleMap
        }}
      >
        {children}
      </GoogleMapsContext.Provider>
    </>
  );
};

export default React.memo(GoogleMaps);

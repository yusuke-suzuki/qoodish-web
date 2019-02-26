import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer
} from 'react-google-maps';
import { compose } from 'recompose';

import gMapMounted from '../../actions/gMapMounted';
import mapZoomChanged from '../../actions/mapZoomChanged';

const CreateResourceButton = React.lazy(() =>
  import(/* webpackChunkName: "create_resource_button" */ '../molecules/CreateResourceButton')
);
const LocationButton = React.lazy(() =>
  import(/* webpackChunkName: "location_button" */ '../molecules/LocationButton')
);
const SpotMarkers = React.lazy(() =>
  import(/* webpackChunkName: "spot_markers" */ './SpotMarkers')
);
const CurrentPositionMarker = React.lazy(() =>
  import(/* webpackChunkName: "current_position_marker" */ '../molecules/CurrentPositionMarker')
);

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
  },
  button: {
    position: 'relative',
    right: 0,
    bottom: 0
  }
};

const MapWithAnOverlayView = compose(
  withScriptjs,
  withGoogleMap
)(props => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      gMap: state.gMap.gMap,
      currentMap: state.mapDetail.currentMap,
      defaultCenter: state.gMap.defaultCenter,
      defaultZoom: state.gMap.defaultZoom,
      center: state.gMap.center,
      zoom: state.gMap.zoom,
      directions: state.gMap.directions
    }),
    []
  );
  const {
    gMap,
    currentMap,
    defaultCenter,
    defaultZoom,
    center,
    zoom,
    directions
  } = useMappedState(mapState);

  const onZoomChanged = useCallback(zoom => {
    dispatch(mapZoomChanged(zoom));
  });

  return (
    <GoogleMap
      ref={props.onMapLoad}
      options={{
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
          style: google.maps.ZoomControlStyle.SMALL
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
        },
        scaleControl: true,
        mapTypeControl: false,
        gestureHandling: 'greedy'
      }}
      defaultCenter={defaultCenter}
      defaultZoom={defaultZoom}
      center={
        new google.maps.LatLng(parseFloat(center.lat), parseFloat(center.lng))
      }
      zoom={zoom}
      onZoomChanged={() => onZoomChanged(gMap.getZoom())}
    >
      <React.Suspense fallback={null}>
        <SpotMarkers />
        <CurrentPositionMarker />
      </React.Suspense>
      <DirectionsRenderer directions={directions} />
      <div style={styles.button}>
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
    </GoogleMap>
  );
});

const GMap = props => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');

  const onMapMounted = useCallback(map => {
    dispatch(gMapMounted(map));
  });

  return (
    <MapWithAnOverlayView
      {...props}
      googleMapURL={process.env.GOOGLE_MAP_URL}
      containerElement={
        <div style={large ? styles.mapWrapperLarge : styles.mapWrapperSmall} />
      }
      mapElement={<div style={large ? styles.mapLarge : styles.mapSmall} />}
      loadingElement={<div style={{ height: '100%' }} />}
      onMapLoad={onMapMounted}
    />
  );
};

export default React.memo(GMap);

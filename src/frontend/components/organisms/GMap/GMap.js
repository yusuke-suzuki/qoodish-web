import React from 'react';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer
} from 'react-google-maps';
import { compose } from 'recompose';
import loadable from '@loadable/component';

const CreateResourceButton = loadable(() =>
  import(/* webpackChunkName: "create_resource_button" */ '../../molecules/CreateResourceButton')
);
const LocationButton = loadable(() =>
  import(/* webpackChunkName: "location_button" */ '../../molecules/LocationButton')
);
const SpotMarkers = loadable(() =>
  import(/* webpackChunkName: "spot_markers" */ '../SpotMarkers')
);
const CurrentPositionMarker = loadable(() =>
  import(/* webpackChunkName: "current_position_marker" */ '../../molecules/CurrentPositionMarker')
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
)(props => (
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
    defaultCenter={props.defaultCenter}
    defaultZoom={props.defaultZoom}
    center={
      new google.maps.LatLng(
        parseFloat(props.center.lat),
        parseFloat(props.center.lng)
      )
    }
    zoom={props.zoom}
    onZoomChanged={() => props.onZoomChanged(props.gMap.getZoom())}
    onMapLoad={props.onMapMounted}
  >
    <SpotMarkers />
    <CurrentPositionMarker />
    <DirectionsRenderer directions={props.directions} />
    <div style={styles.button}>
      <CreateResourceButton
        buttonForMap
        disabled={
          !(
            props.currentMap &&
            props.currentMap.postable &&
            props.currentMap.following
          )
        }
      />
      <LocationButton />
    </div>
  </GoogleMap>
));

const GMap = props => {
  return (
    <MapWithAnOverlayView
      {...props}
      googleMapURL={process.env.GOOGLE_MAP_URL}
      containerElement={
        <div
          style={props.large ? styles.mapWrapperLarge : styles.mapWrapperSmall}
        />
      }
      mapElement={
        <div style={props.large ? styles.mapLarge : styles.mapSmall} />
      }
      loadingElement={<div style={{ height: '100%' }} />}
      onMapLoad={props.onMapMounted}
    />
  );
};

export default GMap;

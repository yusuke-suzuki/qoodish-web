import React from 'react';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer
} from 'react-google-maps';
import { compose } from 'recompose';
import loadable from '@loadable/component';

const CreateResourceButtonContainer = loadable(() =>
  import(/* webpackChunkName: "create_resource_button" */ '../containers/CreateResourceButtonContainer')
);
const LocationButtonContainer = loadable(() =>
  import(/* webpackChunkName: "location_button" */ '../containers/LocationButtonContainer')
);
const SpotMarkersContainer = loadable(() =>
  import(/* webpackChunkName: "spot_markers" */ '../containers/SpotMarkersContainer')
);
const CurrentPositionMarkerContainer = loadable(() =>
  import(/* webpackChunkName: "current_position_marker" */ '../containers/CurrentPositionMarkerContainer')
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
  mapContainerLarge: {
    height: '100%',
    width: '100%'
  },
  mapContainerSmall: {
    height: '100%',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  buttonContainer: {
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
    <SpotMarkersContainer />
    <CurrentPositionMarkerContainer />
    <DirectionsRenderer directions={props.directions} />
    <div style={styles.buttonContainer}>
      <CreateResourceButtonContainer
        buttonForMap
        disabled={
          !(
            props.currentMap &&
            props.currentMap.postable &&
            props.currentMap.following
          )
        }
      />
      <LocationButtonContainer />
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
        <div
          style={
            props.large ? styles.mapContainerLarge : styles.mapContainerSmall
          }
        />
      }
      loadingElement={<div style={{ height: '100%' }} />}
      onMapLoad={props.onMapMounted}
    />
  );
};

export default GMap;

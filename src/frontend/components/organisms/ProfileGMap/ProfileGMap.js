import React from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';

const styles = {
  mapWrapperLarge: {
    height: 200
  },
  mapWrapperSmall: {
    height: 150
  },
  map: {
    height: '100%'
  }
};

const GoogleMapContainer = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      defaultZoom={props.defaultZoom}
      options={{
        zoomControl: false,
        streetViewControl: false,
        scaleControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'none'
      }}
      center={
        new google.maps.LatLng(
          parseFloat(props.center.lat),
          parseFloat(props.center.lng)
        )
      }
    />
  ))
);

const ProfileGMap = props => {
  return (
    <GoogleMapContainer
      {...props}
      googleMapURL={process.env.GOOGLE_MAP_URL}
      containerElement={
        <div
          style={props.large ? styles.mapWrapperLarge : styles.mapWrapperSmall}
        />
      }
      mapElement={<div style={styles.map} />}
      loadingElement={<div style={{ height: '100%' }} />}
    />
  );
};

export default ProfileGMap;

import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

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
  withGoogleMap(() => {
    const mapState = useCallback(
      state => ({
        defaultZoom: state.gMap.defaultZoom,
        center: state.gMap.center
      }),
      []
    );

    const { defaultZoom, center } = useMappedState(mapState);

    return (
      <GoogleMap
        defaultZoom={defaultZoom}
        options={{
          zoomControl: false,
          streetViewControl: false,
          scaleControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'none'
        }}
        center={
          new google.maps.LatLng(parseFloat(center.lat), parseFloat(center.lng))
        }
      />
    );
  })
);

const ProfileGMap = () => {
  const large = useMediaQuery('(min-width: 600px)');

  return (
    <GoogleMapContainer
      googleMapURL={process.env.GOOGLE_MAP_URL}
      containerElement={
        <div style={large ? styles.mapWrapperLarge : styles.mapWrapperSmall} />
      }
      mapElement={<div style={styles.map} />}
      loadingElement={<div style={{ height: '100%' }} />}
    />
  );
};

export default React.memo(ProfileGMap);

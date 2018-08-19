import React from 'react';
import {
  Marker,
} from 'react-google-maps';

export default class SpotMarkers extends React.PureComponent {
  render() {
    return this.props.currentPosition.lat && this.props.currentPosition.lng ? this.renderMarker() : null;
  }

  renderMarker() {
    return (
      <Marker
        options={{
          position: this.props.currentPosition,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#0088ff',
            fillOpacity: 0.8,
            strokeColor: '#0088ff',
            strokeOpacity: 0.2
          }
        }}
      />
    );
  }
}

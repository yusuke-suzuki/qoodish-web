import React from 'react';
import {
  OverlayView,
  Marker
} from 'react-google-maps';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../containers/I18n';

const styles = {
  overlayButton: {
    backgroundColor: 'white'
  }
};

export default class SpotMarkers extends React.PureComponent {
  render() {
    return this.props.currentPosition.lat && this.props.currentPosition.lng ? this.renderMarkers() : null;
  }

  renderMarkers() {
    return (
      <div>
        {this.renderMarker()}
        {this.renderProfileIcon()}
      </div>
    );
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

  renderProfileIcon() {
    return (
      <OverlayView
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        position={this.props.currentPosition}
      >
        {this.props.large ?
        <Tooltip title={I18n.t("you are hear")}>
          <Button
            variant="fab"
            style={styles.overlayButton}
          >
            <Avatar
              src={this.props.currentUser.thumbnail_url}
              alt={I18n.t("you are hear")}
            />
          </Button>
        </Tooltip>
        :
        <Button
          variant="fab"
          style={styles.overlayButton}
        >
          <Avatar
            src={this.props.currentUser.thumbnail_url}
            alt={I18n.t("you are hear")}
          />
        </Button>
        }
      </OverlayView>
    );
  }
}

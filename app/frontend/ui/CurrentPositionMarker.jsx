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
    backgroundColor: 'white',
    width: 40,
    height: 40
  }
};

const CircleMarker = (props) => {
  return (
    <Marker
      options={{
        position: props.currentPosition,
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

const ProfileIcon = (props) => {
  return (
    <OverlayView
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      position={props.currentPosition}
    >
      {props.large ?
      <Tooltip title={I18n.t("you are hear")}>
        <Button
          variant="fab"
          style={styles.overlayButton}
        >
          <Avatar
            src={props.currentUser.thumbnail_url}
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
          src={props.currentUser.thumbnail_url}
          alt={I18n.t("you are hear")}
        />
      </Button>
      }
    </OverlayView>
  );
}

const CurrentPositionMarker = (props) => {
  return props.currentPosition.lat && props.currentPosition.lng ? (
    <div>
      <CircleMarker {...props} />
      <ProfileIcon {...props} />
    </div>
  ) : null;
}

export default CurrentPositionMarker;

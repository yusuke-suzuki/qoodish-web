import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker, DirectionsRenderer, InfoWindow } from 'react-google-maps';
import MapSummaryContainer from '../containers/MapSummaryContainer';
import SpotDetailContainer from '../containers/SpotDetailContainer';
import ReviewDialogContainer from '../containers/ReviewDialogContainer';
import PlaceSelectDialogContainer from '../containers/PlaceSelectDialogContainer';
import EditReviewDialogContainer from '../containers/EditReviewDialogContainer';
import DeleteReviewDialogContainer from '../containers/DeleteReviewDialogContainer';
import EditMapDialogContainer from '../containers/EditMapDialogContainer';
import DeleteMapDialogContainer from '../containers/DeleteMapDialogContainer';
import JoinMapDialogContainer from '../containers/JoinMapDialogContainer';
import LeaveMapDialogContainer from '../containers/LeaveMapDialogContainer';
import AddLocationIcon from 'material-ui-icons/AddLocation';
import Button from 'material-ui/Button';
import BottomNavigation, { BottomNavigationAction } from 'material-ui/BottomNavigation';
import PlaceIcon from 'material-ui-icons/Place';
import InfoIcon from 'material-ui-icons/Info';
import Paper from 'material-ui/Paper';

const styles = {
  mapWrapperLarge: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    right: 0,
    left: 350,
    marginTop: 64
  },
  mapWrapperSmall: {
    position: 'fixed',
    top: 0,
    bottom: 56,
    right: 0,
    left: 0,
    marginTop: 56
  },
  mapContainer: {
    height: '100%'
  },
  createButtonLarge: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 32,
    right: 32,
    backgroundColor: 'red',
    color: 'white'
  },
  createButtonSmall: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 76,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  },
  bottomNav: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    zIndex: 1
  }
}

const mapOptions = {
  zoomControlOptions: {
    position: google.maps.ControlPosition.RIGHT_TOP,
    style: google.maps.ZoomControlStyle.SMALL
  },
  streetViewControl: true,
  streetViewControlOptions: {
    position: google.maps.ControlPosition.RIGHT_TOP
  },
  scaleControl: true,
  mapTypeControl: false
};

const GoogleMapContainer = withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapLoad}
    options={mapOptions}
    defaultCenter={props.defaultCenter}
    defaultZoom={props.defaultZoom}
    center={new google.maps.LatLng(parseFloat(props.center.lat), parseFloat(props.center.lng))}
    zoom={props.zoom}
    onZoomChanged={() => props.onZoomChanged(props.gMap.getZoom())}
    onCenterChanged={() => props.onCenterChanged(props.gMap.getCenter())}
    onMapLoad={props.onMapMounted}
  >
    {props.spots.map((spot, index) => (
      <Marker
        position={new google.maps.LatLng(parseFloat(spot.lat), parseFloat(spot.lng))}
        key={index}
        defaultAnimation={2}
        onClick={() => props.onSpotMarkerClick(spot)}
      >
        {props.currentSpot && props.currentSpot.place_id === spot.place_id &&
          <InfoWindow>
            <b>{spot.name}</b>
          </InfoWindow>
        }
      </Marker>
    ))}
    {props.currentPosition.lat && props.currentPosition.lng ?
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
    /> : null}
    {<DirectionsRenderer directions={props.directions} />}
  </GoogleMap>
));

export default class MapDetail extends Component {
  async componentWillMount() {
    this.props.updatePageTitle();
    if (this.props.currentMap) {
      this.props.initCenter(this.props.currentMap);
      this.props.fetchSpots();
      this.props.fetchCollaborators();
      this.props.fetchMapReviews();
    } else {
      await this.props.fetchMap();
      this.props.fetchSpots();
      this.props.fetchCollaborators();
      this.props.fetchMapReviews();
      this.props.initCenter(this.props.currentMap);
    }
    if (this.props.match.params.reviewId) {
      this.props.fetchReview();
    }
  }

  componentWillUnmount() {
    this.props.handleUnmount();
  }

  render() {
    return (
      <div>
        {this.props.large ? this.renderLarge() : this.renderSmall()}
        {this.ableToPost(this.props.currentMap) ? this.renderCreateReviewButton() : null}
        <SpotDetailContainer />
        <ReviewDialogContainer mapId={this.props.match.params.mapId} />
        <PlaceSelectDialogContainer />
        <EditReviewDialogContainer mapId={this.props.match.params.mapId} />
        <DeleteReviewDialogContainer mapId={this.props.match.params.mapId} />
        <EditMapDialogContainer />
        <DeleteMapDialogContainer mapId={this.props.match.params.mapId} />
        <JoinMapDialogContainer mapId={this.props.match.params.mapId} />
        <LeaveMapDialogContainer mapId={this.props.match.params.mapId} />
      </div>
    );
  }

  renderLarge() {
    return (
      <div>
        {this.renderMapSummary()}
        {this.renderGoogleMap()}
      </div>
    );
  }

  renderSmall() {
    return (
      <div>
        {this.props.tabValue === 0 && this.renderMapSummary()}
        {this.props.tabValue === 1 && this.renderGoogleMap()}
        {this.renderBottomNav()}
      </div>
    );
  }

  renderMapSummary() {
    return (
      <MapSummaryContainer mapId={this.props.match.params.mapId} />
    );
  }

  renderGoogleMap() {
    return (
      <GoogleMapContainer
        {...this.props}
        containerElement={
          <div style={this.props.large ? styles.mapWrapperLarge : styles.mapWrapperSmall} />
        }
        mapElement={
          <div style={styles.mapContainer} />
        }
        onMapLoad={this.props.onMapMounted}
      />
    );
  }

  renderBottomNav() {
    return (
      <Paper style={styles.bottomNav}>
        <BottomNavigation showLabels value={this.props.tabValue}>
          <BottomNavigationAction
            label='SUMMARY'
            icon={<InfoIcon />}
            onClick={this.props.handleSummaryTabClick}
          />
          <BottomNavigationAction
            label='MAP'
            icon={<PlaceIcon />}
            onClick={this.props.handleMapTabClick}
          />
        </BottomNavigation>
      </Paper>
    );
  }

  ableToPost(map) {
    if (!map) {
      return false;
    } else {
      return map.editable || (map.shared && !map.private) || (map.private && map.following && map.shared);
    }
  }

  renderCreateReviewButton() {
    return (
      <Button
        fab
        aria-label='add'
        style={this.props.large ? styles.createButtonLarge : styles.createButtonSmall}
        onClick={this.props.handleCreateReviewClick}
      >
        <AddLocationIcon />
      </Button>
    );
  }
}

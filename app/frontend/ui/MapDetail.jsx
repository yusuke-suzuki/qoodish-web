import React, { Component } from 'react';
import {
  withGoogleMap,
  GoogleMap,
  Marker,
  DirectionsRenderer,
  InfoWindow
} from 'react-google-maps';
import MapSummaryContainer from '../containers/MapSummaryContainer';
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
import PlaceIcon from 'material-ui-icons/Place';
import InfoIcon from 'material-ui-icons/Info';
import Paper from 'material-ui/Paper';
import SpotCardContainer from '../containers/SpotCardContainer';

const styles = {
  mapWrapperLarge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 350,
    marginTop: 64
  },
  mapWrapperSmall: {
    paddingTop: 112,
    paddingBottom: 56,
    height: 'calc(100vh - 160px)'
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
  }
};

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
    center={
      new google.maps.LatLng(
        parseFloat(props.center.lat),
        parseFloat(props.center.lng)
      )
    }
    zoom={props.zoom}
    onZoomChanged={() => props.onZoomChanged(props.gMap.getZoom())}
    onCenterChanged={() => props.onCenterChanged(props.gMap.getCenter())}
    onMapLoad={props.onMapMounted}
  >
    {props.spots.map((spot, index) => (
      <Marker
        position={
          new google.maps.LatLng(parseFloat(spot.lat), parseFloat(spot.lng))
        }
        key={index}
        defaultAnimation={2}
        onClick={() => props.onSpotMarkerClick(spot)}
      >
        {props.currentSpot &&
          props.currentSpot.place_id === spot.place_id && (
            <InfoWindow>
              <b>{spot.name}</b>
            </InfoWindow>
          )}
      </Marker>
    ))}
    {props.currentPosition.lat && props.currentPosition.lng ? (
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
    ) : null}
    {<DirectionsRenderer directions={props.directions} />}
    <SpotCardContainer mapId={props.match.params.mapId} />
  </GoogleMap>
));

export default class MapDetail extends Component {
  async componentWillMount() {
    this.props.updatePageTitle();
    if (!this.props.large) {
      this.props.showTabs();
    }

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

    if (!this.props.large) {
      this.props.updatePageTitle(this.props.currentMap.name);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hash) {
      if (nextProps.hash === '#map') {
        nextProps.switchMap();
      } else if (nextProps.hash === '#summary') {
        nextProps.switchSummary();
      }
    } else {
      nextProps.switchSummary();
    }
  }

  componentWillUnmount() {
    this.props.handleUnmount();
  }

  render() {
    return (
      <div>
        {this.props.large ? this.renderLarge() : this.renderSmall()}
        {this.ableToPost(this.props.currentMap)
          ? this.renderCreateReviewButton()
          : null}
        <ReviewDialogContainer />
        <PlaceSelectDialogContainer />
        <EditReviewDialogContainer mapId={this.props.match.params.mapId} />
        <DeleteReviewDialogContainer />
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
      </div>
    );
  }

  renderMapSummary() {
    return <MapSummaryContainer mapId={this.props.match.params.mapId} />;
  }

  renderGoogleMap() {
    return (
      <GoogleMapContainer
        {...this.props}
        containerElement={
          <div
            style={
              this.props.large ? styles.mapWrapperLarge : styles.mapWrapperSmall
            }
          />
        }
        mapElement={<div style={styles.mapContainer} />}
        onMapLoad={this.props.onMapMounted}
      />
    );
  }

  ableToPost(map) {
    if (!map) {
      return false;
    } else {
      return map.postable;
    }
  }

  renderCreateReviewButton() {
    return (
      <Button
        fab
        aria-label="add"
        style={
          this.props.large ? styles.createButtonLarge : styles.createButtonSmall
        }
        onClick={this.props.handleCreateReviewClick}
      >
        <AddLocationIcon />
      </Button>
    );
  }
}

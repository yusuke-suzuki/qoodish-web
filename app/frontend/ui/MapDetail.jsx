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
import Card, { CardContent } from 'material-ui/Card';
import ExpandLess from 'material-ui-icons/ExpandLess';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';

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
    bottom: 67.84,
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
    bottom: 87.84,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  },
  mapCard: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    zIndex: 1
  },
  mapCardContent: {
    padding: 0
  },
  listItemText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  listItemContent: {
    overflow: 'hidden'
  },
  mapAvatarImage: {
    width: 40,
    height: 40
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
    this.controlMapSummary(this.props);
    if (this.props.match.params.reviewId) {
      this.props.fetchReview();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.large != this.props.large) {
      this.controlMapSummary(nextProps);
    }
  }

  controlMapSummary(props) {
    if (props.large) {
      props.openMapSummary();
    } else {
      props.closeMapSummary();
    }
  }

  componentWillUnmount() {
    this.props.handleUnmount();
  }

  render() {
    return (
      <div>
        {this.props.currentMap ? <MapSummaryContainer mapId={this.props.match.params.mapId} /> : null}
        {!this.props.large ? this.renderMapCard() : null}
        <SpotDetailContainer />
        <ReviewDialogContainer mapId={this.props.match.params.mapId} />
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
        {this.ableToPost(this.props.currentMap) ? this.renderCreateReviewButton() : null}
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

  renderMapCard() {
    return (
      <Card style={styles.mapCard}>
        <CardContent style={styles.mapCardContent}>
          <ListItem button onClick={this.props.openMapSummary}>
            <Avatar style={styles.secondaryAvatar}>
              <img src={this.props.currentMap && this.props.currentMap.image_url} style={styles.mapAvatarImage} />
            </Avatar>
            <ListItemText
              primary={
                <div style={styles.listItemText}>
                  {this.props.currentMap && this.props.currentMap.name}
                </div>
              }
              secondary={
                <div style={styles.listItemText}>
                  {this.props.currentMap && this.props.currentMap.description}
                </div>
              }
              style={styles.listItemContent}
            />
            <ExpandLess />
          </ListItem>
        </CardContent>
      </Card>
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

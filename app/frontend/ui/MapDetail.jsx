import React from 'react';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  DirectionsRenderer,
  InfoWindow
} from 'react-google-maps';
import MapSummaryContainer from '../containers/MapSummaryContainer';
import DeleteMapDialogContainer from '../containers/DeleteMapDialogContainer';
import JoinMapDialogContainer from '../containers/JoinMapDialogContainer';
import LeaveMapDialogContainer from '../containers/LeaveMapDialogContainer';
import InviteTargetDialogContainer from '../containers/InviteTargetDialogContainer';
import AddLocationIcon from 'material-ui-icons/AddLocation';
import Button from 'material-ui/Button';
import PlaceIcon from 'material-ui-icons/Place';
import InfoIcon from 'material-ui-icons/Info';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import Typography from 'material-ui/Typography';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import SpotCardContainer from '../containers/SpotCardContainer';
import Helmet from 'react-helmet';

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
    height: 'calc(100vh - 56px)'
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
  createButtonForMapDialog: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 20,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  },
  appbar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  },
  toolbar: {
    paddingLeft: 8
  }
};

function Transition(props) {
  return <Slide direction="left" {...props} />;
}

const GoogleMapContainer = withScriptjs(withGoogleMap(props => (
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
)));

export default class MapDetail extends React.Component {
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

    if (!this.props.large) {
      this.props.updatePageTitle(this.props.currentMap.name);
    }

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': `/maps/${this.props.currentMap.id}`,
      'page_title': `${this.props.currentMap.name} | Qoodish`
    });
  }

  componentWillUnmount() {
    this.props.handleUnmount();
  }

  render() {
    return (
      <div>
        {this.props.currentMap && this.renderHelmet(this.props.currentMap)}
        {this.props.large ? this.renderLarge() : this.renderSmall()}
        {this.ableToPost(this.props.currentMap)
          ? this.renderCreateReviewButton()
          : null}
        <DeleteMapDialogContainer mapId={this.props.match.params.mapId} />
        <JoinMapDialogContainer mapId={this.props.match.params.mapId} />
        <LeaveMapDialogContainer mapId={this.props.match.params.mapId} />
        <InviteTargetDialogContainer mapId={this.props.match.params.mapId} />
      </div>
    );
  }

  renderHelmet(map) {
    return (
      <Helmet
        title={`${map.name} | Qoodish`}
        link={[
          { rel: "canonical", href: `${process.env.ENDPOINT}/maps/${map.id}` }
        ]}
        meta={[
          { name: 'title', content: `${map.name} | Qoodish` },
          { name: 'description', content: map.description },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: `${map.name} | Qoodish` },
          { name: 'twitter:description', content: map.description },
          { name: 'twitter:image', content: map.image_url },
          { property: 'og:title', content: `${map.name} | Qoodish` },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}/maps/${map.id}`
          },
          { property: 'og:image', content: map.image_url },
          {
            property: 'og:description',
            content: map.description
          }
        ]}
      />
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
        {this.renderMapSummary()}
        {this.renderMapDialog()}
      </div>
    );
  }

  renderMapDialog() {
    return (
      <Dialog
        open={this.props.mapDialogOpen}
        onClose={this.props.handleMapDialogClose}
        fullWidth
        fullScreen={true}
        transition={Transition}
      >
        <AppBar style={styles.appbar} color="primary">
          <Toolbar style={styles.toolbar}>
            <IconButton
              color="inherit"
              onClick={this.props.handleMapDialogClose}
              aria-label="Close"
            >
              <ChevronRightIcon />
            </IconButton>
            <Typography variant="title" color="inherit" style={styles.flex} noWrap>
              {this.props.currentMap && this.props.currentMap.name}
            </Typography>
          </Toolbar>
        </AppBar>
        {this.renderGoogleMap()}
        {this.ableToPost(this.props.currentMap) && this.renderCreateReviewButtonForMapDialog()}
      </Dialog>
    );
  }

  renderMapSummary() {
    return <MapSummaryContainer mapId={this.props.match.params.mapId} />;
  }

  renderGoogleMap() {
    return (
      <GoogleMapContainer
        {...this.props}
        googleMapURL={process.env.GOOGLE_MAP_URL}
        containerElement={
          <div
            style={
              this.props.large ? styles.mapWrapperLarge : styles.mapWrapperSmall
            }
          />
        }
        mapElement={<div style={styles.mapContainer} />}
        loadingElement={<div style={{ height: '100%' }} />}
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

  renderCreateReviewButtonForMapDialog() {
    return (
      <div hidden={this.props.spotCardOpen}>
        <Button
          variant="fab"
          aria-label="add"
          style={styles.createButtonForMapDialog}
          onClick={this.props.handleCreateReviewClick}
        >
          <AddLocationIcon />
        </Button>
      </div>
    );
  }

  renderCreateReviewButton() {
    return (
      <Button
        variant="fab"
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

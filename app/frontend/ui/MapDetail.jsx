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
import CreateReviewButtonContainer from '../containers/CreateReviewButtonContainer';
import LocationButtonContainer from '../containers/LocationButtonContainer';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import CloseIcon from 'material-ui-icons/Close';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import SpotCardContainer from '../containers/SpotCardContainer';
import Helmet from 'react-helmet';
import Drawer from 'material-ui/Drawer';

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
    height: '100%'
  },
  mapContainer: {
    height: '100%'
  },
  appbar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  },
  toolbar: {
    paddingLeft: 8,
    height: 56
  },
  drawerPaper: {
    height: '100%'
  },
  drawerContainer: {
    height: '100%',
    width: '100%',
    overflow: 'hidden'
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
          ? <CreateReviewButtonContainer />
          : null}
        {this.props.large && <LocationButtonContainer />}
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
      <Drawer
        anchor="bottom"
        open={this.props.mapDialogOpen}
        onClose={this.props.handleMapDialogClose}
        PaperProps={{style: styles.drawerPaper}}
      >
        <AppBar style={styles.appbar} color="primary">
          <Toolbar style={styles.toolbar}>
            <IconButton
              color="inherit"
              onClick={this.props.handleMapDialogClose}
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="title" color="inherit" style={styles.flex} noWrap>
              {this.props.currentMap && this.props.currentMap.name}
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={styles.drawerContainer}>
          {this.renderGoogleMap()}
          {this.ableToPost(this.props.currentMap) && this.renderCreateReviewButtonForMapDialog()}
          {this.renderLocationButtonForMapDialog()}
        </div>
      </Drawer>
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
        <CreateReviewButtonContainer withoutBottomSeat={true} />
      </div>
    );
  }

  renderLocationButtonForMapDialog() {
    return (
      <div hidden={this.props.spotCardOpen}>
        <LocationButtonContainer />
      </div>
    );
  }
}

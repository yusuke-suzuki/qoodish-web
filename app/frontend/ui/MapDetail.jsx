import React from 'react';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  OverlayView,
  DirectionsRenderer
} from 'react-google-maps';
import { compose } from 'recompose';
import MapSummaryContainer from '../containers/MapSummaryContainer';
import MapBottomSeatContainer from '../containers/MapBottomSeatContainer';
import DeleteMapDialogContainer from '../containers/DeleteMapDialogContainer';
import JoinMapDialogContainer from '../containers/JoinMapDialogContainer';
import LeaveMapDialogContainer from '../containers/LeaveMapDialogContainer';
import InviteTargetDialogContainer from '../containers/InviteTargetDialogContainer';
import CreateReviewButtonContainer from '../containers/CreateReviewButtonContainer';
import LocationButtonContainer from '../containers/LocationButtonContainer';
import SpotCardContainer from '../containers/SpotCardContainer';
import Helmet from 'react-helmet';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';
import Tooltip from 'material-ui/Tooltip';
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
  containerLarge: {
  },
  containerSmall: {
    position: 'fixed',
    top: 56,
    left: 0,
    bottom: 136,
    right: 0,
    display: 'block',
    width: '100%'
  },
  mapWrapperSmall: {
    height: '100%'
  },
  mapContainerLarge: {
    height: '100%',
    width: '100%'
  },
  mapContainerSmall: {
    height: '100%',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  overlayButton: {
    backgroundColor: 'white'
  },
  buttonContainer: {
    position: 'relative',
    right: 0,
    bottom: 0
  },
  drawerPaper: {
    height: '100%',
    overflow: 'hidden'
  },
};

const MapWithAnOverlayView = compose(
  withScriptjs,
  withGoogleMap
)(props =>
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
      <OverlayView
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        key={index}
        position={
          new google.maps.LatLng(parseFloat(spot.lat), parseFloat(spot.lng))
        }
      >
        {props.large ?
        <Tooltip title={spot.name}>
          <Button
            variant="fab"
            style={styles.overlayButton}
            onClick={() => props.onSpotMarkerClick(spot)}
          >
            <Avatar src={spot.image_url} />
          </Button>
        </Tooltip>
        :
        <Button
          variant="fab"
          style={styles.overlayButton}
          onClick={() => props.onSpotMarkerClick(spot)}
        >
          <Avatar src={spot.image_url} />
        </Button>
        }
      </OverlayView>
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
    <div style={styles.buttonContainer}>
      <CreateReviewButtonContainer
        buttonForMap={props.large ? false : true}
        disabled={!(props.currentMap && props.currentMap.postable)}
      />
      <LocationButtonContainer />
    </div>
  </GoogleMap>
);

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
        <DeleteMapDialogContainer mapId={this.props.match.params.mapId} />
        <JoinMapDialogContainer mapId={this.props.match.params.mapId} />
        <LeaveMapDialogContainer mapId={this.props.match.params.mapId} />
        <InviteTargetDialogContainer mapId={this.props.match.params.mapId} />
        <SpotCardContainer mapId={this.props.match.params.mapId} />
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
        <MapSummaryContainer mapId={this.props.match.params.mapId} />
        {this.renderGoogleMap()}
      </div>
    );
  }

  renderSmall() {
    return (
      <div>
        <div style={this.props.large ? styles.containerLarge : styles.containerSmall}>
          {this.renderGoogleMap()}
        </div>
        <MapBottomSeatContainer currentMap={this.props.currentMap} />
        {this.renderMapSummaryDrawer()}
      </div>
    );
  }

  renderGoogleMap() {
    return (
      <MapWithAnOverlayView
        {...this.props}
        googleMapURL={process.env.GOOGLE_MAP_URL}
        containerElement={
          <div
            style={
              this.props.large ? styles.mapWrapperLarge : styles.mapWrapperSmall
            }
          />
        }
        mapElement={<div style={this.props.large ? styles.mapContainerLarge : styles.mapContainerSmall} />}
        loadingElement={<div style={{ height: '100%' }} />}
        onMapLoad={this.props.onMapMounted}
      />
    );
  }

  renderMapSummaryDrawer() {
    return (
      <Drawer
        variant="temporary"
        anchor="bottom"
        open={this.props.mapSummaryOpen}
        PaperProps={{ style: styles.drawerPaper }}
      >
        <MapSummaryContainer mapId={this.props.match.params.mapId} dialogMode />
      </Drawer>
    );
  }
}

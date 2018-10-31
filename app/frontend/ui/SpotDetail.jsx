import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import PlaceIcon from '@material-ui/icons/Place';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import Helmet from 'react-helmet';
import NoContentsContainer from '../containers/NoContentsContainer';
import CreateReviewButtonContainer from '../containers/CreateReviewButtonContainer';
import I18n from '../containers/I18n';
import ReviewTilesContainer from '../containers/ReviewTilesContainer';

const styles = {
  rootLarge: {
    margin: '94px auto 20px',
    maxWidth: 700
  },
  rootSmall: {
    marginTop: 56,
    marginBottom: 56
  },
  cardMapContainerLarge: {
    minHeight: 300
  },
  cardMapContainerSmall: {
    minHeight: 200
  },
  mapWrapperLarge: {
    height: 300
  },
  mapWrapperSmall: {
    height: 200
  },
  mapContainer: {
    height: '100%'
  },
  cardLarge: {},
  cardSmall: {
    minHeight: 'calc(100vh - 112px)'
  },
  cardContent: {
    textAlign: 'center'
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  reviewTilesContainer: {
    marginTop: 16
  }
};

const GoogleMapContainer = withScriptjs(withGoogleMap(props => (
  <GoogleMap
    defaultZoom={props.defaultZoom}
    options={{
      zoomControl: false,
      streetViewControl: false,
      scaleControl: false,
      mapTypeControl: false,
      gestureHandling: 'greedy'
    }}
    center={
      props.currentSpot &&
      new google.maps.LatLng(
        parseFloat(props.currentSpot.lat),
        parseFloat(props.currentSpot.lng)
      )
    }
  >
    <Marker
      position={
        props.currentSpot &&
        new google.maps.LatLng(
          parseFloat(props.currentSpot.lat),
          parseFloat(props.currentSpot.lng)
        )
      }
      defaultAnimation={2}
    />
  </GoogleMap>
)));

class SpotDetail extends React.PureComponent {
  async componentDidMount() {
    this.props.updatePageTitle();
    if (!this.props.currentSpot) {
      await this.props.fetchSpot();
    }
    this.props.fetchSpotReviews();

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': `/spots/${this.props.currentSpot.place_id}`,
      'page_title': `${this.props.currentSpot.name} | Qoodish`
    });
  }

  componentWillUnmount() {
    this.props.clear();
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        {this.props.currentSpot && this.renderHelmet(this.props.currentSpot)}
        {this.renderContainer()}
        {this.props.currentSpot &&
          <CreateReviewButtonContainer spot={this.props.currentSpot} buttonWithBottomSeat={!this.props.large} />}
      </div>
    );
  }

  renderHelmet(spot) {
    return (
      <Helmet
        title={`${spot.name} | Qoodish`}
        link={[
          { rel: 'canonical', href: `${process.env.ENDPOINT}/spots/${spot.place_id}` }
        ]}
        meta={[
          { name: 'title', content: `${spot.name} | Qoodish` },
          { name: 'keywords', content: `${spot.name}, Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`},
          { name: 'description', content: spot.formatted_address },
          { name: 'twitter:card', content: 'summary' },
          { name: 'twitter:title', content: `${spot.name} | Qoodish` },
          { name: 'twitter:description', content: spot.formatted_address },
          { name: 'twitter:image', content: spot.image_url },
          { property: 'og:title', content: `${spot.name} | Qoodish` },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}/spots/${spot.place_id}`
          },
          { property: 'og:image', content: spot.image_url },
          {
            property: 'og:description',
            content: spot.formatted_address
          }
        ]}
      />
    );
  }

  renderMap() {
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
      />
    );
  }

  renderContainer() {
    return (
      <div>
        {this.props.spotLoading
          ? this.renderProgress()
          : this.renderSpotDetail()}
      </div>
    );
  }

  renderSpotDetail() {
    if (this.props.currentSpot) {
      return this.renderSpotCard(this.props.currentSpot);
    } else {
      return (
        <NoContentsContainer
          contentType="spot"
          message={I18n.t('place not found')}
        />
      );
    }
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  renderSpotCard(spot) {
    return (
      <Card style={this.props.large ? styles.cardLarge : styles.cardSmall}>
        <div style={this.props.large ? styles.cardMapContainerLarge : styles.cardMapContainerSmall}>
          {this.renderMap()}
        </div>
        <CardContent style={styles.cardContent}>
          <PlaceIcon />
          <Typography variant="h5">{spot.name}</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {spot.formatted_address}
          </Typography>
          <div style={styles.reviewTilesContainer}>
            <ReviewTilesContainer
              reviews={this.props.spotReviews}
              spacing={this.props.large ? 16 : 4}
              cellHeight={this.props.large ? 140 : 100}
              showSubheader
            />
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default SpotDetail;

import React from 'react';
import List, {
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import PlaceIcon from 'material-ui-icons/Place';
import { CircularProgress } from 'material-ui/Progress';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import AddLocationIcon from 'material-ui-icons/AddLocation';
import Helmet from 'react-helmet';
import NoContentsContainer from '../containers/NoContentsContainer';
import CreateReviewButtonContainer from '../containers/CreateReviewButtonContainer';

const styles = {
  rootLarge: {
    marginTop: 94,
    marginBottom: 20
  },
  rootSmall: {
    marginTop: 56,
    marginBottom: 56
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
  listLarge: {
    maxWidth: 600,
    margin: '0 auto'
  },
  listSmall: {},
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12,
    marginTop: 4
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  reviewComment: {
    marginRight: 20
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

class SpotDetail extends React.Component {
  async componentWillMount() {
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
          <CreateReviewButtonContainer spot={this.props.currentSpot} />}
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
          message="Place not found."
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
        {this.renderMap()}
        <CardContent style={styles.cardContent}>
          <PlaceIcon />
          <Typography variant="headline">{spot.name}</Typography>
          <Typography variant="subheading" color="textSecondary">
            {spot.formatted_address}
          </Typography>
        </CardContent>
        <List style={this.props.large ? styles.listLarge : styles.listSmall}>
          {this.renderSpotReviews(this.props.spotReviews)}
        </List>
      </Card>
    );
  }

  renderSpotReviews(reviews) {
    return reviews.map(review => (
      <ListItem
        button
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
      >
        <Avatar src={review.author.profile_image_url} />
        <ListItemText
          disableTypography={true}
          primary={
            <Typography variant="subheading" noWrap>
              {review.author.name}
            </Typography>
          }
          secondary={
            <Typography
              component="p"
              noWrap
              color="textSecondary"
              style={styles.reviewComment}
            >
              {review.comment}
            </Typography>
          }
        />
        {review.image && (
          <ListItemSecondaryAction>
            <Avatar src={review.image.thumbnail_url} style={styles.secondaryAvatar} />
          </ListItemSecondaryAction>
        )}
      </ListItem>
    ));
  }
}

export default SpotDetail;

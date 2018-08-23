import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
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

class SpotDetail extends React.PureComponent {
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
          <Typography variant="headline">{spot.name}</Typography>
          <Typography variant="subheading" color="textSecondary">
            {spot.formatted_address}
          </Typography>
        </CardContent>
        <List>
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
        <Avatar
          src={review.author.profile_image_url}
          alt={review.author.name}
        />
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
          <ListItemSecondaryAction
            onClick={() => this.props.handleReviewClick(review)}
          >
            <Avatar
              src={review.image.thumbnail_url}
              style={styles.secondaryAvatar}
              alt={review.spot.name}
            />
          </ListItemSecondaryAction>
        )}
      </ListItem>
    ));
  }
}

export default SpotDetail;

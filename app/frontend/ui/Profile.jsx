import React from 'react';
import Avatar from 'material-ui/Avatar';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import Helmet from 'react-helmet';
import Tabs, { Tab } from 'material-ui/Tabs';
import { CircularProgress } from 'material-ui/Progress';
import Button from 'material-ui/Button';
import ReviewCardContainer from '../containers/ReviewCardContainer';
import I18n from '../containers/I18n';
import MapCollectionContainer from '../containers/MapCollectionContainer';
import NoContentsContainer from '../containers/NoContentsContainer';
import SwipeableViews from 'react-swipeable-views';

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
  userMapsContainerLarge: {
    marginTop: 20,
    marginBottom: 20
  },
  userMapsContainerSmall: {
    marginTop: 8,
    marginBottom: 64
  },
  reviewsContainerLarge: {
    margin: '0 auto 20px'
  },
  reviewsContainerSmall: {
    margin: '0 auto'
  },
  profileContainer: {
    textAlign: 'center'
  },
  profileAvatarLarge: {
    margin: '-64px auto 20px',
    width: 80,
    height: 80
  },
  profileAvatarSmall: {
    margin: '-54px auto 20px',
    width: 80,
    height: 80
  },
  cardContentLarge: {
    padding: 24
  },
  cardContentSmall: {
    padding: 16
  },
  count: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  buttonContainer: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 72
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  gridHeader: {
    width: '100%',
    display: 'inline-flex',
    marginBottom: 15
  },
  reviewCardContainerSmall: {
    marginTop: 16
  },
  reviewCardContainerLarge: {
    marginTop: 20
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
      fullscreenControl: false,
      gestureHandling: 'none'
    }}
    center={
      new google.maps.LatLng(
        parseFloat(props.center.lat),
        parseFloat(props.center.lng)
      )
    }
  >
  </GoogleMap>
)));

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0
    };
    this.handleSwipeChange = this.handleSwipeChange.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleClickLoadMoreButton = this.handleClickLoadMoreButton.bind(this);
  }

  componentWillMount() {
    this.props.updatePageTitle();
    this.props.fetchUserProfile();
    this.props.fetchReviews();
    this.props.fetchUserMaps();

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/profile',
      'page_title': 'Profile | Qoodish'
    });
  }

  componentWillUnmount() {
    this.props.clearProfileState();
  }

  handleClickLoadMoreButton() {
    this.props.loadMoreReviews(this.props.nextTimestamp);
  }

  handleSwipeChange(value) {
    this.setState({
      tabValue: value
    });
  }

  handleTabChange(e, value) {
    this.setState({
      tabValue: value
    });
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        {this.props.currentUser && this.renderHelmet(this.props.currentUser)}
        {this.props.currentUser && this.renderProfileCard(this.props.currentUser)}
        <SwipeableViews
          animateHeight
          index={this.state.tabValue}
          onChangeIndex={this.handleSwipeChange}
        >
          {this.renderReviews()}
          {this.renderUserMaps()}
        </SwipeableViews>
      </div>
    );
  }

  renderHelmet(currentUser) {
    return (
      <Helmet
        title={`${currentUser.name} | Qoodish`}
        link={[
          { rel: 'canonical', href: `${process.env.ENDPOINT}/profile` }
        ]}
        meta={[
          { name: 'title', content: `${currentUser.name} | Qoodish` },
          { name: 'description', content: '' },
          { name: 'twitter:card', content: 'summary' },
          { name: 'twitter:title', content: `${currentUser.name} | Qoodish` },
          { name: 'twitter:description', content: '' },
          { name: 'twitter:image', content: currentUser.image_url },
          { property: 'og:title', content: `${currentUser.name} | Qoodish` },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}/profile`
          },
          { property: 'og:image', content: currentUser.image_url },
          {
            property: 'og:description',
            content: ''
          }
        ]}
      />
    );
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
      />
    );
  }

  renderProfileCard(currentUser) {
    return (
      <Card>
        {this.renderGoogleMap()}
        <CardContent style={this.props.large ? styles.cardContentLarge : styles.cardContentSmall}>
          <Avatar
            src={currentUser && currentUser.image_url}
            style={this.props.large ? styles.profileAvatarLarge : styles.profileAvatarSmall}
          />
          <div style={styles.profileContainer}>
            <Typography variant="headline" gutterBottom>
              {currentUser && currentUser.name}
            </Typography>
          </div>
          <Tabs
            value={this.state.tabValue}
            onChange={this.handleTabChange}
            fullWidth
            centered
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              icon="Reports"
              label={<div style={styles.count}>{this.props.currentUser.reviews_count}</div>}
            />
            <Tab
              icon="Maps"
              label={<div style={styles.count}>{this.props.currentUser.maps_count}</div>}
            />
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  renderReviews() {
    return (
      <div
        style={this.props.large ? styles.reviewsContainerLarge : styles.reviewsContainerSmall}
        key='reviews'
      >
        {this.props.loadingReviews
          ? this.renderProgress()
          : this.renderReviewContainer(this.props.currentReviews)}
      </div>
    );
  }

  renderReviewContainer(reviews) {
    if (reviews.length > 0) {
      return (
        <div>
          {this.renderReviewCards(reviews)}
          {this.props.loadingMoreReviews
            ? this.renderProgress()
            : this.renderLoadMoreButton()}
        </div>
      );
    } else {
      return (
        <NoContentsContainer
          contentType="review"
          message={I18n.t('reports will see here')}
        />
      );
    }
  }

  renderReviewCards(reviews) {
    return reviews.map(review => (
      <div
        key={review.id}
        style={
          this.props.large
            ? styles.reviewCardContainerLarge
            : styles.reviewCardContainerSmall
        }
      >
        <ReviewCardContainer currentReview={review} />
      </div>
    ));
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  renderLoadMoreButton() {
    if (this.props.noMoreReviews) {
      return null;
    }
    return (
      <div style={styles.buttonContainer}>
        <Button
          variant="raised"
          onClick={this.handleClickLoadMoreButton}
          style={
            this.props.large
              ? styles.raisedButtonLarge
              : styles.raisedButtonSmall
          }
        >
          {I18n.t('load more')}
        </Button>
      </div>
    );
  }

  renderUserMaps() {
    return (
      <div
        key='usermaps'
        style={this.props.large ? styles.userMapsContainerLarge : styles.userMapsContainerSmall}
      >
        {this.props.loadingMaps
          ? this.renderProgress()
          : this.renderMapContainer(this.props.currentMaps)}
      </div>
    );
  }

  renderMapContainer(maps) {
    if (maps.length > 0) {
      return (
        <MapCollectionContainer maps={maps} />
      );
    } else {
      return (
        <NoContentsContainer
          contentType="map"
          message="No maps have been created."
        />
      );
    }
  }
}

export default Profile;

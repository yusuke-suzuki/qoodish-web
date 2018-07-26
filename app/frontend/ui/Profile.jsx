import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Helmet from 'react-helmet';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import PersonIcon from '@material-ui/icons/Person';
import ReviewCardContainer from '../containers/ReviewCardContainer';
import I18n from '../containers/I18n';
import MapCollectionContainer from '../containers/MapCollectionContainer';
import NoContentsContainer from '../containers/NoContentsContainer';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';

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
  personIcon: {
    fontSize: 40
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
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleClickLoadMoreButton = this.handleClickLoadMoreButton.bind(this);
  }

  componentWillMount() {
    this.props.updatePageTitle();

    if (!this.props.currentUser.isAnonymous) {
      this.props.fetchUserProfile();
      this.props.fetchReviews();
      this.props.fetchUserMaps();
    }

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

  handleTabChange(e, value) {
    this.setState({
      tabValue: value
    });
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        {this.renderHelmet(this.props.currentUser)}
        {this.renderProfileCard(this.props.currentUser)}
        <div>
          {this.state.tabValue === 0 && this.renderReviews()}
          {this.state.tabValue === 1 && this.renderUserMaps()}
        </div>
      </div>
    );
  }

  renderHelmet(currentUser) {
    return (
      <Helmet
        title={`${currentUser.name ? currentUser.name : 'Profile'} | Qoodish`}
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
        <div style={this.props.large ? styles.cardMapContainerLarge : styles.cardMapContainerSmall}>
          {this.renderGoogleMap()}
        </div>
        <CardContent style={this.props.large ? styles.cardContentLarge : styles.cardContentSmall}>
          {this.renderAvatar(currentUser)}
          <div style={styles.profileContainer}>
            <Typography variant="headline" gutterBottom>
              {currentUser.isAnonymous ? "Anonymous user" : currentUser.name}
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
              label={<div style={styles.count}>{this.props.currentUser.reviews_count || 0}</div>}
            />
            <Tab
              icon="Maps"
              label={<div style={styles.count}>{this.props.currentUser.maps_count || 0}</div>}
            />
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  renderAvatar(currentUser) {
    if (currentUser.isAnonymous) {
      return (
        <Avatar
          style={this.props.large ? styles.profileAvatarLarge : styles.profileAvatarSmall}
        >
          <PersonIcon style={styles.personIcon} />
        </Avatar>
      );
    } else {
      return (
        <Avatar
          src={currentUser.image_url}
          style={this.props.large ? styles.profileAvatarLarge : styles.profileAvatarSmall}
        />
      );
    }
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
          action="create-review"
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
          action="create-map"
          message="No maps have been created."
        />
      );
    }
  }
}

export default Profile;

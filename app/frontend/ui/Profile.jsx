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
import ReviewGridListContainer from '../containers/ReviewGridListContainer';
import MapCollectionContainer from '../containers/MapCollectionContainer';
import NoContentsContainer from '../containers/NoContentsContainer';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import I18n from '../containers/I18n';
import SwipeableViews from 'react-swipeable-views';

const styles = {
  rootLarge: {
    maxWidth: 900,
    margin: '94px auto 20px'
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
    paddingBottom: 20
  },
  userMapsContainerSmall: {
    marginTop: 8,
    paddingBottom: 16
  },
  reviewsContainerLarge: {
    marginTop: 20,
    paddingBottom: 20
  },
  reviewsContainerSmall: {
    marginTop: 8,
    paddingBottom: 16
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
  buttonContainerLarge: {
    textAlign: 'center',
    padding: 20
  },
  buttonContainerSmall: {
    textAlign: 'center',
    marginTop: 16,
    paddingBottom: 8
  },
  progress: {
    textAlign: 'center',
    padding: 20,
    marginTop: 20
  },
  gridHeader: {
    width: '100%',
    display: 'inline-flex',
    marginBottom: 15
  },
  noReviewsContainerLarge: {
    paddingTop: 20
  },
  noReviewsContainerSmall: {
    paddingTop: 8
  },
  editProfileButton: {
    marginTop: 10,
    marginBottom: 20
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

class Profile extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
    this.handleClickLoadMoreButton = this.handleClickLoadMoreButton.bind(this);
  }

  componentDidMount() {
    this.props.updatePageTitle();

    if (!this.props.currentUser.isAnonymous) {
      this.props.fetchUserProfile();
      this.props.fetchReviews();
      this.props.fetchUserMaps();
    }

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/profile',
      'page_title': `${I18n.t('account')} | Qoodish`
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

  handleChangeIndex(value) {
    this.setState({
      tabValue: value
    });
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        {this.props.currentUser.name && this.renderHelmet(this.props.currentUser)}
        {this.renderProfileCard(this.props.currentUser)}
        <SwipeableViews
          index={this.state.tabValue}
          onChangeIndex={this.handleChangeIndex}
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
        title={this.props.pathname === '/profile' ? `${I18n.t('account')} | Qoodish` : `${currentUser.name} | Qoodish`}
        link={[
          { rel: 'canonical', href: `${process.env.ENDPOINT}${this.props.pathname}` }
        ]}
        meta={[
          { name: 'title', content: this.props.pathname === '/profile' ? `${I18n.t('account')} | Qoodish` : `${currentUser.name} | Qoodish` },
          { name: 'twitter:title', content: this.props.pathname === '/profile' ? `${I18n.t('account')} | Qoodish` : `${currentUser.name} | Qoodish` },
          { name: 'twitter:image', content: currentUser.thumbnail_url },
          { property: 'og:title', content: this.props.pathname === '/profile' ? `${I18n.t('account')} | Qoodish` : `${currentUser.name} | Qoodish` },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}${this.props.pathname}`
          },
          this.props.pathname != '/profile' ? { property: 'og:image', content: currentUser.thumbnail_url } : {}
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

  renderEditProfileButton() {
    return (
      <Button
        variant="contained"
        onClick={() => this.props.handleEditProfileButtonClick(this.props.currentUser)}
        color="primary"
        style={styles.editProfileButton}
      >
        {I18n.t('edit profile')}
      </Button>
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
            <Typography variant="h5" gutterBottom>
              {currentUser.isAnonymous ? I18n.t('anonymous user') : currentUser.name}
            </Typography>
            {this.props.pathname === '/profile' && this.renderEditProfileButton()}
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
              icon={I18n.t('reports')}
              label={<div style={styles.count}>{this.props.currentUser.reviews_count || 0}</div>}
            />
            <Tab
              icon={I18n.t('maps')}
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
          src={currentUser.thumbnail_url}
          style={this.props.large ? styles.profileAvatarLarge : styles.profileAvatarSmall}
          alt={currentUser.name}
        />
      );
    }
  }

  renderReviews() {
    return (
      <div key='reviews'>
        {this.props.loadingReviews
          ? this.renderProgress()
          : this.renderReviewContainer(this.props.currentReviews)}
      </div>
    );
  }

  renderReviewContainer(reviews) {
    if (reviews.length > 0) {
      return (
        <div style={this.props.large ? styles.reviewsContainerLarge : styles.reviewsContainerSmall}>
          <ReviewGridListContainer reviews={reviews} />
          {this.props.loadingMoreReviews
            ? this.renderProgress()
            : this.renderLoadMoreButton()}
        </div>
      );
    } else {
      return (
        <div style={this.props.large ? styles.noReviewsContainerLarge : styles.noReviewsContainerSmall}>
          <NoContentsContainer
            contentType="review"
            action="create-review"
            message={I18n.t('reports will see here')}
          />
        </div>
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

  renderLoadMoreButton() {
    if (this.props.noMoreReviews) {
      return null;
    }
    return (
      <div style={this.props.large ? styles.buttonContainerLarge : styles.buttonContainerSmall}>
        <Button
          variant="contained"
          onClick={this.handleClickLoadMoreButton}
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
          message={I18n.t('maps will see here')}
        />
      );
    }
  }
}

export default Profile;

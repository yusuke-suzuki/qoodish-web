import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import Helmet from 'react-helmet';
import Tabs, { Tab } from 'material-ui/Tabs';
import { CircularProgress } from 'material-ui/Progress';
import MapIcon from 'material-ui-icons/Map';
import LockIcon from 'material-ui-icons/Lock';
import GroupIcon from 'material-ui-icons/Group';
import PersonIcon from 'material-ui-icons/Person';
import RateReviewIcon from 'material-ui-icons/RateReview';
import Button from 'material-ui/Button';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import ReviewCardContainer from '../containers/ReviewCardContainer';
import I18n from '../containers/I18n';

const styles = {
  rootLarge: {
    marginBottom: 0
  },
  rootSmall: {
    marginBottom: 56
  },
  mapWrapperLarge: {
    paddingTop: 64,
    height: 300
  },
  mapWrapperSmall: {
    paddingTop: 56,
    height: 200
  },
  mapContainer: {
    height: '100%'
  },
  reviewsContainerLarge: {
    margin: '0 auto 20px',
    width: '40%'
  },
  reviewsContainerSmall: {
    margin: '0 auto'
  },
  mapsContainerLarge: {
    margin: '0 auto',
    width: '80%'
  },
  mapsContainerSmall: {
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
  noContentsContainer: {
    textAlign: 'center',
    color: '#9e9e9e',
    padding: 20
  },
  noContentsIcon: {
    width: 150,
    height: 150
  },
  gridHeader: {
    width: '100%',
    display: 'inline-flex',
    marginBottom: 15
  },
  mapTypeIcon: {
    marginLeft: 16,
    marginRight: 16,
    color: '#fff',
    fontSize: '1.2rem'
  },
  mapTypeContainer: {
    display: 'grid'
  },
  gridList: {
    width: '100%',
    margin: 0
  },
  gridTile: {
    cursor: 'pointer'
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

  handleTabChange(e, value) {
    this.setState({
      tabValue: value
    });
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        {this.props.currentUser && this.renderHelmet(this.props.currentUser)}
        {this.renderMap()}
        {this.props.currentUser && this.renderProfileCard(this.props.currentUser)}
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

  renderProfileCard(currentUser) {
    return (
      <Card>
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

  renderNoReviews() {
    return (
      <div style={styles.noContentsContainer}>
        <RateReviewIcon style={styles.noContentsIcon} />
        <Typography variant="subheading" color="inherit">
          {I18n.t('reports will see here')}
        </Typography>
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
      return this.renderNoReviews();
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
        style={this.props.large ? styles.mapsContainerLarge : styles.mapsContainerSmall}
        key='usermaps'
      >
        {this.props.loadingMaps
          ? this.renderProgress()
          : this.renderMapContainer(this.props.currentMaps)}
      </div>
    );
  }

  renderNoMaps() {
    return (
      <div style={styles.noContentsContainer}>
        <MapIcon style={styles.noContentsIcon} />
        <Typography variant="subheading" color="inherit">
          When you create or follow maps, you will see maps here.
        </Typography>
        <br />
        <Button
          variant="raised"
          color="primary"
          onClick={this.props.handleCreateMapButtonClick}
        >
          Create New Map
        </Button>
      </div>
    );
  }

  renderMapContainer(maps) {
    if (maps.length > 0) {
      return (
        <GridList
          cols={this.props.large ? 4 : 2}
          style={styles.gridList}
          spacing={this.props.large ? 20 : 10}
        >
          {this.renderMaps(maps)}
        </GridList>
      );
    } else {
      return this.renderNoMaps();
    }
  }

  renderMaps(maps) {
    return maps.map(map => (
      <GridListTile
        key={map.id}
        onClick={() => this.props.handleClickMap(map)}
        style={styles.gridTile}
      >
        <img src={map.image_url} />
        <GridListTileBar
          title={map.name}
          subtitle={<span>by: {map.owner_name}</span>}
          actionIcon={<div style={styles.mapTypeContainer}>{this.renderMapTypeIcon(map)}</div>}
        />
      </GridListTile>
    ));
  }

  renderMapTypeIcon(map) {
    let actions = [];
    if (map.private) {
      actions.push(<LockIcon style={styles.mapTypeIcon} key="private" />);
    }
    if (map.shared) {
      actions.push(<GroupIcon style={styles.mapTypeIcon} key="shared" />);
    } else {
      actions.push(<PersonIcon style={styles.mapTypeIcon} key="personal" />);
    }
    return actions;
  }
}

export default Profile;

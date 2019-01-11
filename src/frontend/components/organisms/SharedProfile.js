import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import PersonIcon from '@material-ui/icons/Person';
import ReviewGridList from './ReviewGridList';
import MapCollection from './MapCollection';
import NoContents from '../molecules/NoContents';
import CreateResourceButton from '../molecules/CreateResourceButton';

import I18n from '../../utils/I18n';
import SwipeableViews from 'react-swipeable-views';
import LikesList from './LikesList';
import ProfileGMap from './ProfileGMap';

const styles = {
  rootLarge: {
    maxWidth: 900,
    margin: '94px auto 20px'
  },
  rootSmall: {
    marginTop: 56,
    marginBottom: 56
  },
  cardMapLarge: {
    minHeight: 200
  },
  cardMapSmall: {
    minHeight: 150
  },
  userMapsLarge: {
    marginTop: 20,
    paddingBottom: 20
  },
  userMapsSmall: {
    marginTop: 8,
    paddingBottom: 16
  },
  reviewsLarge: {
    marginTop: 20,
    paddingBottom: 20
  },
  reviewsSmall: {
    marginTop: 8,
    paddingBottom: 16
  },
  profile: {
    paddingTop: 39
  },
  profileAvatarLarge: {
    marginTop: -64,
    width: 80,
    height: 80,
    position: 'absolute'
  },
  profileAvatarSmall: {
    marginTop: -54,
    width: 80,
    height: 80,
    position: 'absolute'
  },
  personIcon: {
    fontSize: 40
  },
  cardContentLarge: {
    padding: 24,
    paddingBottom: 16
  },
  cardContentSmall: {
    padding: 16,
    paddingBottom: 8
  },
  tab: {
    minWidth: 'auto'
  },
  buttonLarge: {
    textAlign: 'center',
    padding: 20
  },
  buttonSmall: {
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
  noReviewsLarge: {
    paddingTop: 20
  },
  noReviewsSmall: {
    paddingTop: 8
  },
  editProfileButton: {},
  profileActions: {
    width: 'max-content',
    marginLeft: 'auto'
  },
  likesLarge: {
    marginTop: 20
  },
  likesSmall: {
    marginTop: 8
  },
  summary: {
    display: 'flex'
  },
  summaryCount: {
    marginRight: '0.5em'
  },
  summaryCountButton: {
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 20
  },
  biography: {
    wordWrap: 'break-word'
  }
};

class SharedProfile extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
    this.handleClickLoadMoreButton = this.handleClickLoadMoreButton.bind(this);
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
        {this.renderProfileCard(this.props.currentUser)}
        <SwipeableViews
          index={this.state.tabValue}
          onChangeIndex={this.handleChangeIndex}
        >
          {this.renderReviews()}
          {this.renderMyMaps()}
          <div style={this.props.large ? styles.likesLarge : styles.likesSmall}>
            <LikesList likes={this.props.likes} />
          </div>
        </SwipeableViews>
        {this.props.large && <CreateResourceButton />}
      </div>
    );
  }

  renderEditProfileButton() {
    return (
      <Button
        variant="outlined"
        onClick={() =>
          this.props.handleEditProfileButtonClick(this.props.currentUser)
        }
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
        <div
          style={this.props.large ? styles.cardMapLarge : styles.cardMapSmall}
        >
          <ProfileGMap />
        </div>
        <CardContent
          style={
            this.props.large ? styles.cardContentLarge : styles.cardContentSmall
          }
        >
          {this.renderAvatar(currentUser)}
          <div style={styles.profileActions}>
            {this.props.pathname === '/profile' &&
              this.renderEditProfileButton()}
          </div>
          <div style={this.props.pathname === '/profile' ? {} : styles.profile}>
            <Typography variant="h5" gutterBottom>
              {currentUser.isAnonymous
                ? I18n.t('anonymous user')
                : currentUser.name}
            </Typography>
          </div>
          <Typography variant="body1" style={styles.biography} gutterBottom>
            {currentUser.biography}
          </Typography>
          {this.renderSummary(currentUser)}
        </CardContent>
        <Tabs
          value={this.state.tabValue}
          onChange={this.handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          centered
        >
          <Tab label={I18n.t('reports')} style={styles.tab} />
          <Tab label={I18n.t('maps')} style={styles.tab} />
          <Tab label={I18n.t('like')} style={styles.tab} />
        </Tabs>
      </Card>
    );
  }

  renderAvatar(currentUser) {
    if (currentUser.isAnonymous) {
      return (
        <Avatar
          style={
            this.props.large
              ? styles.profileAvatarLarge
              : styles.profileAvatarSmall
          }
        >
          <PersonIcon style={styles.personIcon} />
        </Avatar>
      );
    } else {
      return (
        <Avatar
          src={currentUser.thumbnail_url}
          style={
            this.props.large
              ? styles.profileAvatarLarge
              : styles.profileAvatarSmall
          }
          alt={currentUser.name}
        />
      );
    }
  }

  renderSummary(user) {
    return (
      <div style={styles.summary}>
        <Button
          style={styles.summaryCountButton}
          onClick={() => this.handleTabChange(undefined, 0)}
        >
          <Typography variant="subtitle2" style={styles.summaryCount}>
            {user.reviews_count ? user.reviews_count : 0}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {I18n.t('reviews count')}
          </Typography>
        </Button>
        <Button
          style={styles.summaryCountButton}
          onClick={this.props.handleFollowingClick}
        >
          <Typography variant="subtitle2" style={styles.summaryCount}>
            {user.following_maps_count ? user.following_maps_count : 0}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {I18n.t('following maps')}
          </Typography>
        </Button>
      </div>
    );
  }

  renderReviews() {
    return (
      <div key="reviews">
        {this.props.loadingReviews
          ? this.renderProgress()
          : this.renderReview(this.props.currentReviews)}
      </div>
    );
  }

  renderReview(reviews) {
    if (reviews.length > 0) {
      return (
        <div
          style={this.props.large ? styles.reviewsLarge : styles.reviewsSmall}
        >
          <ReviewGridList reviews={reviews} />
          {this.props.loadingMoreReviews
            ? this.renderProgress()
            : this.renderLoadMoreButton()}
        </div>
      );
    } else {
      return (
        <div
          style={
            this.props.large ? styles.noReviewsLarge : styles.noReviewsSmall
          }
        >
          <NoContents
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
      <div style={this.props.large ? styles.buttonLarge : styles.buttonSmall}>
        <Button variant="contained" onClick={this.handleClickLoadMoreButton}>
          {I18n.t('load more')}
        </Button>
      </div>
    );
  }

  renderMyMaps() {
    return (
      <div
        style={this.props.large ? styles.userMapsLarge : styles.userMapsSmall}
      >
        {this.props.loadingMyMaps
          ? this.renderProgress()
          : this.renderMap(this.props.myMaps)}
      </div>
    );
  }

  renderMap(maps) {
    if (maps.length > 0) {
      return <MapCollection maps={maps} />;
    } else {
      return (
        <NoContents
          contentType="map"
          action="create-map"
          message={I18n.t('maps will see here')}
          secondaryAction="discover-maps"
        />
      );
    }
  }
}

export default SharedProfile;

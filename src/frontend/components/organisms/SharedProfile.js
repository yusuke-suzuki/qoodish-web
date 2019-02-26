import React, { useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import CreateResourceButton from '../molecules/CreateResourceButton';

import SwipeableViews from 'react-swipeable-views';
import LikesList from './LikesList';
import ProfileReviews from './ProfileReviews';
import ProfileMyMaps from './ProfileMyMaps';
import EditProfileButton from '../molecules/EditProfileButton';
import ProfileAvatar from '../molecules/ProfileAvatar';

import I18n from '../../utils/I18n';
import openFollowingMapsDialog from '../../actions/openFollowingMapsDialog';

const styles = {
  rootLarge: {
    maxWidth: 900,
    margin: '94px auto 20px'
  },
  rootSmall: {
    marginTop: 56,
    marginBottom: 56
  },
  userMapsLarge: {
    marginTop: 20,
    paddingBottom: 20
  },
  userMapsSmall: {
    marginTop: 8,
    paddingBottom: 16
  },
  profile: {
    paddingTop: 20
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
  },
  staticMapImage: {
    width: '100%',
    height: '100%'
  }
};

const Summary = props => {
  const dispatch = useDispatch();

  const currentUser = props.currentUser;

  const handleFollowingClick = useCallback(() => {
    dispatch(openFollowingMapsDialog());
  });

  return (
    <div style={styles.summary}>
      <Button
        style={styles.summaryCountButton}
        onClick={() => props.handleTabChange(undefined, 0)}
      >
        <Typography variant="subtitle2" style={styles.summaryCount}>
          {currentUser.reviews_count ? currentUser.reviews_count : 0}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {I18n.t('reviews count')}
        </Typography>
      </Button>
      <Button style={styles.summaryCountButton} onClick={handleFollowingClick}>
        <Typography variant="subtitle2" style={styles.summaryCount}>
          {currentUser.following_maps_count
            ? currentUser.following_maps_count
            : 0}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {I18n.t('following maps')}
        </Typography>
      </Button>
    </div>
  );
};

const ProfileCard = props => {
  const large = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      location: state.shared.currentLocation
    }),
    []
  );

  const { location } = useMappedState(mapState);

  const currentUser = props.currentUser;

  return (
    <Card>
      <CardMedia>
        <img
          src={`${process.env.GOOGLE_STATIC_MAP_URL}&zoom=${17}&size=${
            large ? 900 : 400
          }x${200}&scale=${2}&center=${35.710063},${139.8107}`}
          style={styles.staticMapImage}
        />
      </CardMedia>
      <CardContent
        style={large ? styles.cardContentLarge : styles.cardContentSmall}
      >
        <ProfileAvatar currentUser={props.currentUser} />
        <div style={styles.profileActions}>
          {location && location.pathname === '/profile' && (
            <EditProfileButton />
          )}
        </div>
        <div
          style={
            location && location.pathname === '/profile' ? {} : styles.profile
          }
        >
          <Typography variant="h5" gutterBottom>
            {currentUser.isAnonymous
              ? I18n.t('anonymous user')
              : currentUser.name}
          </Typography>
        </div>
        <Typography variant="body1" style={styles.biography} gutterBottom>
          {currentUser.biography}
        </Typography>
        <Summary
          handleTabChange={props.handleTabChange}
          currentUser={props.currentUser}
        />
      </CardContent>
      <Tabs
        value={props.tabValue}
        onChange={props.handleTabChange}
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
};

const ProfileProgress = () => {
  return (
    <div style={styles.progress}>
      <CircularProgress />
    </div>
  );
};

const SharedProfile = props => {
  const large = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      loadingMyMaps: state.profile.loadingMyMaps,
      loadingReviews: state.profile.loadingReviews
    }),
    []
  );

  const { loadingMyMaps, loadingReviews } = useMappedState(mapState);

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = useCallback((e, value) => {
    setTabValue(value);
  });

  const handleChangeIndex = useCallback(value => {
    setTabValue(value);
  });

  return (
    <div style={large ? styles.rootLarge : styles.rootSmall}>
      <ProfileCard
        tabValue={tabValue}
        handleTabChange={handleTabChange}
        currentUser={props.currentUser}
      />
      <SwipeableViews index={tabValue} onChangeIndex={handleChangeIndex}>
        <div key="reviews">
          {loadingReviews ? <ProfileProgress /> : <ProfileReviews {...props} />}
        </div>
        <div style={large ? styles.userMapsLarge : styles.userMapsSmall}>
          {loadingMyMaps ? <ProfileProgress /> : <ProfileMyMaps {...props} />}
        </div>
        <div style={large ? styles.likesLarge : styles.likesSmall}>
          <LikesList {...props} />
        </div>
      </SwipeableViews>
      {large && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(SharedProfile);

import React, { useCallback, useContext, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import CreateResourceButton from '../molecules/CreateResourceButton';

import LikesList from './LikesList';
import ProfileReviews from './ProfileReviews';
import ProfileMyMaps from './ProfileMyMaps';
import EditProfileButton from '../molecules/EditProfileButton';
import ProfileAvatar from '../molecules/ProfileAvatar';

import I18n from '../../utils/I18n';
import openFollowingMapsDialog from '../../actions/openFollowingMapsDialog';
import { useTheme } from '@material-ui/core';
import AuthContext from '../../context/AuthContext';

const styles = {
  cardMedia: {
    height: 200
  },
  userMapsLarge: {
    marginTop: 20,
    paddingBottom: 20,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 40
  },
  userMapsSmall: {
    marginTop: 8,
    paddingBottom: 16,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 40
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
  },
  avatarContainerLarge: {
    marginTop: -75,
    position: 'absolute'
  },
  avatarContainerSmall: {
    marginTop: -56,
    position: 'absolute'
  },
  dummyButton: {
    height: 36
  }
};

const Summary = React.memo(props => {
  const dispatch = useDispatch();

  const { profile, handleTabChange } = props;

  const handleFollowingClick = useCallback(() => {
    dispatch(openFollowingMapsDialog());
  }, [dispatch]);

  return (
    <div style={styles.summary}>
      <Button
        style={styles.summaryCountButton}
        onClick={() => handleTabChange(undefined, 0)}
      >
        <Typography variant="subtitle2" style={styles.summaryCount}>
          {profile.reviews_count ? profile.reviews_count : 0}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {I18n.t('reviews count')}
        </Typography>
      </Button>
      <Button style={styles.summaryCountButton} onClick={handleFollowingClick}>
        <Typography variant="subtitle2" style={styles.summaryCount}>
          {profile.following_maps_count ? profile.following_maps_count : 0}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {I18n.t('following maps')}
        </Typography>
      </Button>
    </div>
  );
});

const ProfileCard = React.memo(props => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const mapState = useCallback(
    state => ({
      location: state.shared.currentLocation
    }),
    []
  );

  const { location } = useMappedState(mapState);
  const { currentUser } = useContext(AuthContext);
  const { profile, handleTabChange, tabValue } = props;

  return (
    <Card elevation={0}>
      <CardMedia style={styles.cardMedia}>
        <img
          src={`${process.env.GOOGLE_STATIC_MAP_URL}&zoom=${17}&size=${
            smUp ? 900 : 400
          }x${200}&scale=${2}&center=${35.710063},${139.8107}`}
          style={styles.staticMapImage}
          loading="lazy"
        />
      </CardMedia>
      <CardContent
        style={smUp ? styles.cardContentLarge : styles.cardContentSmall}
      >
        <div
          style={
            smUp ? styles.avatarContainerLarge : styles.avatarContainerSmall
          }
        >
          <ProfileAvatar size={smUp ? 100 : 80} profile={profile} />
        </div>
        <div style={styles.profileActions}>
          {location && location.pathname === '/profile' ? (
            <EditProfileButton />
          ) : (
            <div style={styles.dummyButton} />
          )}
        </div>
        <Typography variant="h5" gutterBottom>
          {currentUser && currentUser.isAnonymous
            ? I18n.t('anonymous user')
            : profile.name}
        </Typography>
        <Typography variant="body1" style={styles.biography} gutterBottom>
          {profile.biography}
        </Typography>
        <Summary handleTabChange={handleTabChange} profile={profile} />
      </CardContent>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
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
});

const SharedProfile = props => {
  const { profile } = props;

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = useCallback((e, value) => {
    setTabValue(value);
  }, []);

  return (
    <div>
      <ProfileCard
        tabValue={tabValue}
        handleTabChange={handleTabChange}
        profile={profile}
      />
      <div>
        {tabValue === 0 && <ProfileReviews {...props} />}
        {tabValue === 1 && (
          <div style={smUp ? styles.userMapsLarge : styles.userMapsSmall}>
            <ProfileMyMaps {...props} />
          </div>
        )}
        {tabValue === 2 && (
          <div style={smUp ? styles.likesLarge : styles.likesSmall}>
            <LikesList {...props} />
          </div>
        )}
      </div>
      {smUp && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(SharedProfile);

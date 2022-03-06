import React, { useCallback, useContext, useState } from 'react';
import { useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';

import LikesList from './LikesList';
import ProfileReviews from './ProfileReviews';
import ProfileMyMaps from './ProfileMyMaps';
import EditProfileButton from '../molecules/EditProfileButton';
import ProfileAvatar from '../molecules/ProfileAvatar';

import I18n from '../../utils/I18n';
import openFollowingMapsDialog from '../../actions/openFollowingMapsDialog';
import { Box, createStyles, Theme, useTheme } from '@material-ui/core';
import AuthContext from '../../context/AuthContext';
import { makeStyles } from '@material-ui/core';
import { useRouter } from 'next/router';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardMedia: {
      height: 200
    },
    userMaps: {
      marginTop: theme.spacing(1),
      paddingBottom: theme.spacing(2),
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      marginBottom: theme.spacing(5),
      [theme.breakpoints.up('sm')]: {
        marginTop: 20,
        paddingBottom: 20
      }
    },
    cardContent: {
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(3),
        paddingBottom: theme.spacing(2)
      }
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
    likes: {
      marginTop: theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        marginTop: 20
      }
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
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'bottom'
    },
    avatarContainer: {
      marginTop: -56,
      position: 'absolute',
      [theme.breakpoints.up('sm')]: {
        marginTop: -75
      }
    },
    dummyButton: {
      height: 36
    }
  })
);

type SummaryProps = {
  profile: any;
  handleTabChange: Function;
};

const Summary = React.memo((props: SummaryProps) => {
  const dispatch = useDispatch();

  const { profile, handleTabChange } = props;

  const handleFollowingClick = useCallback(() => {
    dispatch(openFollowingMapsDialog());
  }, [dispatch]);

  const classes = useStyles();

  return (
    <Box display="flex">
      <Button
        className={classes.summaryCountButton}
        onClick={() => handleTabChange(undefined, 0)}
      >
        <Typography variant="subtitle2" className={classes.summaryCount}>
          {profile.reviews_count ? profile.reviews_count : 0}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {I18n.t('reviews count')}
        </Typography>
      </Button>
      <Button
        className={classes.summaryCountButton}
        onClick={handleFollowingClick}
      >
        <Typography variant="subtitle2" className={classes.summaryCount}>
          {profile.following_maps_count ? profile.following_maps_count : 0}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {I18n.t('following maps')}
        </Typography>
      </Button>
    </Box>
  );
});

type ProfileCardProps = {
  profile: any;
  handleTabChange: any;
  tabValue: any;
};

const ProfileCard = React.memo((props: ProfileCardProps) => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const { currentUser } = useContext(AuthContext);
  const { profile, handleTabChange, tabValue } = props;

  const classes = useStyles();
  const router = useRouter();

  return (
    <Card elevation={0}>
      <CardMedia className={classes.cardMedia}>
        <img
          src={`${
            process.env.NEXT_PUBLIC_GOOGLE_STATIC_MAP_URL
          }&zoom=${17}&size=${
            smUp ? 900 : 400
          }x${200}&scale=${2}&center=${35.710063},${139.8107}`}
          className={classes.staticMapImage}
          loading="lazy"
        />
      </CardMedia>
      <CardContent className={classes.cardContent}>
        <div className={classes.avatarContainer}>
          <ProfileAvatar size={smUp ? 100 : 80} profile={profile} />
        </div>
        <div className={classes.profileActions}>
          {router.pathname === '/profile' ? (
            <EditProfileButton />
          ) : (
            <div className={classes.dummyButton} />
          )}
        </div>
        <Typography variant="h5" gutterBottom>
          {currentUser && currentUser.isAnonymous
            ? I18n.t('anonymous user')
            : profile.name}
        </Typography>
        <Typography variant="body1" className={classes.biography} gutterBottom>
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
        <Tab label={I18n.t('reports')} className={classes.tab} />
        <Tab label={I18n.t('maps')} className={classes.tab} />
        <Tab label={I18n.t('like')} className={classes.tab} />
      </Tabs>
    </Card>
  );
});

type Props = {
  profile: any;
};

const SharedProfile = (props: Props) => {
  const { profile } = props;

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = useCallback((e, value) => {
    setTabValue(value);
  }, []);

  const classes = useStyles();

  return (
    <>
      <ProfileCard
        tabValue={tabValue}
        handleTabChange={handleTabChange}
        profile={profile}
      />
      <>
        {tabValue === 0 && <ProfileReviews userId={profile.id} />}
        {tabValue === 1 && (
          <div className={classes.userMaps}>
            <ProfileMyMaps userId={profile.id} />
          </div>
        )}
        {tabValue === 2 && (
          <div className={classes.likes}>
            <LikesList userId={profile.id} />
          </div>
        )}
      </>
    </>
  );
};

export default React.memo(SharedProfile);

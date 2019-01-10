import React from 'react';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import PlaceIcon from '@material-ui/icons/Place';
import I18n from '../containers/I18n';
import { Link } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import moment from 'moment';
import PublicIcon from '@material-ui/icons/Public';
import LockIcon from '@material-ui/icons/Lock';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';
import ReviewTilesContainer from '../containers/ReviewTilesContainer';

const styles = {
  text: {
    wordBreak: 'break-all'
  },
  chip: {
    marginBottom: 16,
    marginRight: 12
  },
  followersContainer: {
    display: 'flex'
  },
  followerAvatar: {
    marginBottom: 16,
    marginRight: -10.66666667,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderRadius: '50%',
    borderStyle: 'solid',
    float: 'right',
    borderWidth: 1,
    cursor: 'pointer'
  },
  skeltonTextPrimary: {
    width: '100%',
    height: '1.5rem',
    marginBottom: 16
  },
  skeltonTextSecondary: {
    width: '50%',
    height: '0.875rem',
    marginBottom: 16
  },
  skeltonAvatar: {
    width: 40,
    height: 40,
    marginBottom: 16
  }
};

const Followers = props => {
  return props.followers.slice(0, 9).map(follower => (
    <ButtonBase
      key={follower.id}
      component={Link}
      to={`/users/${follower.id}`}
      title={follower.name}
    >
      <Avatar
        src={follower.profile_image_url}
        alt={follower.name}
        style={styles.followerAvatar}
      />
    </ButtonBase>
  ));
};

const createdAt = map => {
  return moment(map.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(window.currentLocale)
    .format('LL');
};

const MapTypes = props => {
  let mapTypes = [];
  if (props.map.private) {
    mapTypes.push(
      <Chip
        key="private"
        avatar={
          <Avatar>
            <LockIcon />
          </Avatar>
        }
        label={I18n.t('private')}
        style={styles.chip}
      />
    );
  } else {
    mapTypes.push(
      <Chip
        key="public"
        avatar={
          <Avatar>
            <PublicIcon />
          </Avatar>
        }
        label={I18n.t('public')}
        style={styles.chip}
      />
    );
  }
  if (props.map.shared) {
    mapTypes.push(
      <Chip
        key="shared"
        avatar={
          <Avatar>
            <GroupIcon />
          </Avatar>
        }
        label={I18n.t('shared')}
        style={styles.chip}
      />
    );
  } else {
    mapTypes.push(
      <Chip
        key="personal"
        avatar={
          <Avatar>
            <PersonIcon />
          </Avatar>
        }
        label={I18n.t('personal')}
        style={styles.chip}
      />
    );
  }
  return mapTypes;
};

const MapSummaryCard = props => {
  return (
    <div>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('map name')}
        </Typography>
        {props.map ? (
          <Typography variant="h5" gutterBottom style={styles.text}>
            {props.map.name}
          </Typography>
        ) : (
          <Chip style={styles.skeltonTextPrimary} />
        )}

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('owner')}
        </Typography>
        <ButtonBase
          component={Link}
          to={props.map ? `/users/${props.map.owner_id}` : '/'}
          title={props.map && props.map.owner_name}
        >
          <Chip
            avatar={
              <Avatar
                src={props.map && props.map.owner_image_url}
                alt={props.map && props.map.owner_name}
              />
            }
            label={props.map && props.map.owner_name}
            style={styles.chip}
            clickable
          />
        </ButtonBase>

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('description')}
        </Typography>
        {props.map ? (
          <Typography variant="subtitle1" gutterBottom style={styles.text}>
            {props.map.description}
          </Typography>
        ) : (
          <Chip style={styles.skeltonTextSecondary} />
        )}

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('map base')}
        </Typography>
        <Chip
          avatar={
            <Avatar>
              <PlaceIcon />
            </Avatar>
          }
          label={
            props.map &&
            (props.map.base.name ? props.map.base.name : I18n.t('not set'))
          }
          style={styles.chip}
          clickable
          onClick={() => props.handleBaseClick(props.map)}
        />

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('created date')}
        </Typography>
        {props.map ? (
          <Typography variant="subtitle1" gutterBottom style={styles.text}>
            {createdAt(props.map)}
          </Typography>
        ) : (
          <Chip style={styles.skeltonTextSecondary} />
        )}

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('map type')}
        </Typography>
        {props.map ? (
          <MapTypes {...props} />
        ) : (
          <Chip avatar={<Avatar src="" alt="" />} style={styles.chip} />
        )}

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {`${props.map ? props.map.followers_count : 0} ${I18n.t(
            'followers count'
          )}`}
        </Typography>
        <div style={styles.followersContainer}>
          {props.map ? (
            <Followers {...props} />
          ) : (
            <Avatar style={styles.skeltonAvatar}>
              <PersonIcon />
            </Avatar>
          )}
        </div>

        <ReviewTilesContainer reviews={props.mapReviews} showSubheader />
      </CardContent>
    </div>
  );
};

export default MapSummaryCard;

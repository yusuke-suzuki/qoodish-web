import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import PlaceIcon from '@material-ui/icons/Place';
import I18n from '../../utils/I18n';
import Link from '../molecules/Link';
import ButtonBase from '@material-ui/core/ButtonBase';
import moment from 'moment';
import PublicIcon from '@material-ui/icons/Public';
import LockIcon from '@material-ui/icons/Lock';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';
import ReviewTiles from './ReviewTiles';

import requestMapCenter from '../../actions/requestMapCenter';

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

const Followers = () => {
  const followers = useMappedState(
    useCallback(state => state.mapSummary.followers, [])
  );

  return followers.slice(0, 9).map(follower => (
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

const MapTypes = () => {
  const map = useMappedState(
    useCallback(state => state.mapSummary.currentMap, [])
  );

  let mapTypes = [];
  if (map.private) {
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
  if (map.shared) {
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

const MapSummaryCard = () => {
  const map = useMappedState(
    useCallback(state => state.mapSummary.currentMap, [])
  );
  const mapReviews = useMappedState(
    useCallback(state => state.mapSummary.mapReviews, [])
  );
  const dispatch = useDispatch();

  const handleBaseClick = useCallback(() => {
    dispatch(requestMapCenter(map.base.lat, map.base.lng));
  });

  return (
    <div>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('map name')}
        </Typography>
        {map ? (
          <Typography variant="h5" gutterBottom style={styles.text}>
            {map.name}
          </Typography>
        ) : (
          <Chip style={styles.skeltonTextPrimary} />
        )}

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('owner')}
        </Typography>
        <ButtonBase
          component={Link}
          to={map ? `/users/${map.owner_id}` : '/'}
          title={map && map.owner_name}
        >
          <Chip
            avatar={
              <Avatar
                src={map && map.owner_image_url}
                alt={map && map.owner_name}
              />
            }
            label={map && map.owner_name}
            style={styles.chip}
            clickable
          />
        </ButtonBase>

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('description')}
        </Typography>
        {map ? (
          <Typography variant="subtitle1" gutterBottom style={styles.text}>
            {map.description}
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
          label={map && (map.base.name ? map.base.name : I18n.t('not set'))}
          style={styles.chip}
          clickable
          onClick={handleBaseClick}
        />

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('created date')}
        </Typography>
        {map ? (
          <Typography variant="subtitle1" gutterBottom style={styles.text}>
            {createdAt(map)}
          </Typography>
        ) : (
          <Chip style={styles.skeltonTextSecondary} />
        )}

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('map type')}
        </Typography>
        {map ? (
          <MapTypes />
        ) : (
          <Chip avatar={<Avatar src="" alt="" />} style={styles.chip} />
        )}

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {`${map ? map.followers_count : 0} ${I18n.t('followers count')}`}
        </Typography>
        <div style={styles.followersContainer}>
          {map ? (
            <Followers />
          ) : (
            <Avatar style={styles.skeltonAvatar}>
              <PersonIcon />
            </Avatar>
          )}
        </div>

        <ReviewTiles reviews={mapReviews} showSubheader />
      </CardContent>
    </div>
  );
};

export default React.memo(MapSummaryCard);

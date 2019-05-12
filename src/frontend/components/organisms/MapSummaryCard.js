import React, { useCallback, useEffect, useState } from 'react';
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
import { LikesApi } from 'qoodish_api';
import fetchLikes from '../../actions/fetchLikes';
import openLikesDialog from '../../actions/openLikesDialog';

const styles = {
  text: {
    wordBreak: 'break-all'
  },
  description: {
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap'
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

const MapLikes = React.memo(() => {
  const [likes, setLikes] = useState([]);
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      currentMap: state.mapSummary.currentMap
    }),
    []
  );
  const { currentUser, currentMap } = useMappedState(mapState);

  const refreshLikes = useCallback(async () => {
    const apiInstance = new LikesApi();

    apiInstance.mapsMapIdLikesGet(currentMap.id, (error, data, response) => {
      if (response.ok) {
        setLikes(response.body);
        dispatch(fetchLikes(response.body));
      }
    });
  });

  const handleLikesClick = useCallback(() => {
    dispatch(openLikesDialog());
  });

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    if (currentMap) {
      refreshLikes();
    }
  }, [currentMap, currentUser.uid]);

  return likes
    .slice(0, 9)
    .map(like => (
      <Avatar
        src={like.voter.profile_image_url}
        alt={like.voter.name}
        style={styles.followerAvatar}
        onClick={handleLikesClick}
      />
    ));
});

const Followers = React.memo(() => {
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
});

const createdAt = map => {
  return moment(map.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(window.currentLocale)
    .format('LL');
};

const MapTypes = React.memo(() => {
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
});

const MapSummaryCard = () => {
  const mapState = useCallback(
    state => ({
      currentMap: state.mapSummary.currentMap,
      mapReviews: state.mapSummary.mapReviews
    }),
    []
  );
  const { currentMap, mapReviews } = useMappedState(mapState);
  const dispatch = useDispatch();

  const handleBaseClick = useCallback(() => {
    dispatch(requestMapCenter(currentMap.base.lat, currentMap.base.lng));
  });

  return (
    <div>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('map name')}
        </Typography>
        {currentMap ? (
          <Typography variant="h5" gutterBottom style={styles.text}>
            {currentMap.name}
          </Typography>
        ) : (
          <Chip style={styles.skeltonTextPrimary} />
        )}

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('owner')}
        </Typography>
        <ButtonBase
          component={Link}
          to={currentMap ? `/users/${currentMap.owner_id}` : '/'}
          title={currentMap && currentMap.owner_name}
        >
          <Chip
            avatar={
              <Avatar
                src={currentMap && currentMap.owner_image_url}
                alt={currentMap && currentMap.owner_name}
              />
            }
            label={currentMap && currentMap.owner_name}
            style={styles.chip}
            clickable
          />
        </ButtonBase>

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('description')}
        </Typography>
        {currentMap ? (
          <Typography
            variant="subtitle1"
            gutterBottom
            style={styles.description}
          >
            {currentMap.description}
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
            currentMap &&
            (currentMap.base.name ? currentMap.base.name : I18n.t('not set'))
          }
          style={styles.chip}
          clickable
          onClick={handleBaseClick}
        />

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('created date')}
        </Typography>
        {currentMap ? (
          <Typography variant="subtitle1" gutterBottom style={styles.text}>
            {createdAt(currentMap)}
          </Typography>
        ) : (
          <Chip style={styles.skeltonTextSecondary} />
        )}

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {I18n.t('map type')}
        </Typography>
        {currentMap ? (
          <MapTypes />
        ) : (
          <Chip avatar={<Avatar src="" alt="" />} style={styles.chip} />
        )}

        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {`${currentMap ? currentMap.followers_count : 0} ${I18n.t(
            'followers count'
          )}`}
        </Typography>
        <div style={styles.followersContainer}>
          {currentMap ? (
            <Followers />
          ) : (
            <Avatar style={styles.skeltonAvatar}>
              <PersonIcon />
            </Avatar>
          )}
        </div>

        {currentMap && currentMap.likes_count > 0 && (
          <React.Fragment>
            <Typography variant="subtitle2" gutterBottom color="textSecondary">
              {`${currentMap.likes_count} ${I18n.t('like users')}`}
            </Typography>
            <div style={styles.followersContainer}>
              <MapLikes currentMap={currentMap} />
            </div>
          </React.Fragment>
        )}

        <ReviewTiles reviews={mapReviews} showSubheader />
      </CardContent>
    </div>
  );
};

export default React.memo(MapSummaryCard);

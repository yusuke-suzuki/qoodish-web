import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import PlaceIcon from '@material-ui/icons/Place';
import I18n from '../../utils/I18n';
import { Link } from '@yusuke-suzuki/rize-router';
import ButtonBase from '@material-ui/core/ButtonBase';
import moment from 'moment';
import PublicIcon from '@material-ui/icons/Public';
import LockIcon from '@material-ui/icons/Lock';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';

import requestMapCenter from '../../actions/requestMapCenter';
import Skeleton from '@material-ui/lab/Skeleton';
import ReviewGridList from './ReviewGridList';
import ReviewImageTile from './ReviewImageTile';
import FollowerAvatars from '../molecules/FollowerAvatars';
import VoterAvatars from '../molecules/VoterAvatars';

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
  avatarsContainer: {
    marginBottom: 16,
    cursor: 'pointer'
  }
};

const parseDate = date => {
  return moment(date, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(I18n.locale)
    .format('LL');
};

const MapTypes = React.memo(props => {
  const { currentMap } = props;

  let mapTypes = [];
  if (currentMap.private) {
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
  if (currentMap.shared) {
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
    if (!currentMap.base) {
      return;
    }
    dispatch(requestMapCenter(currentMap.base.lat, currentMap.base.lng));
  }, [dispatch, currentMap]);

  return (
    <CardContent>
      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {I18n.t('map name')}
      </Typography>
      {currentMap ? (
        <Typography variant="h5" gutterBottom style={styles.text}>
          {currentMap.name}
        </Typography>
      ) : (
        <Skeleton height={32} width="80%" />
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
              loading="lazy"
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
        <Typography variant="subtitle1" gutterBottom style={styles.description}>
          {currentMap.description}
        </Typography>
      ) : (
        <React.Fragment>
          <Skeleton height={32} width="100%" />
          <Skeleton height={32} width="100%" />
        </React.Fragment>
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
          currentMap && currentMap.base
            ? currentMap.base.name
            : I18n.t('not set')
        }
        style={styles.chip}
        clickable
        onClick={handleBaseClick}
      />

      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {I18n.t('last reported date')}
      </Typography>
      {currentMap ? (
        <Typography variant="subtitle1" gutterBottom style={styles.text}>
          {currentMap.last_reported_at
            ? parseDate(currentMap.last_reported_at)
            : '-'}
        </Typography>
      ) : (
        <Skeleton height={28} width="40%" />
      )}

      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {I18n.t('created date')}
      </Typography>
      {currentMap ? (
        <Typography variant="subtitle1" gutterBottom style={styles.text}>
          {parseDate(currentMap.created_at)}
        </Typography>
      ) : (
        <Skeleton height={28} width="40%" />
      )}

      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {I18n.t('map type')}
      </Typography>
      {currentMap ? (
        <MapTypes currentMap={currentMap} />
      ) : (
        <React.Fragment>
          <Chip
            avatar={<Skeleton variant="circle" width={24} height={24} />}
            style={styles.chip}
          />
          <Chip
            avatar={<Skeleton variant="circle" width={24} height={24} />}
            style={styles.chip}
          />
        </React.Fragment>
      )}

      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {`${currentMap ? currentMap.followers_count : 0} ${I18n.t(
          'followers count'
        )}`}
      </Typography>
      <div style={styles.avatarsContainer}>
        {currentMap ? (
          <FollowerAvatars />
        ) : (
          <Skeleton variant="circle" width={40} height={40} />
        )}
      </div>

      {currentMap && currentMap.likes_count > 0 && (
        <React.Fragment>
          <Typography variant="subtitle2" gutterBottom color="textSecondary">
            {`${currentMap.likes_count} ${I18n.t('like users')}`}
          </Typography>
          <div style={styles.avatarsContainer}>
            <VoterAvatars />
          </div>
        </React.Fragment>
      )}

      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {`${mapReviews.length} ${I18n.t('reviews count')}`}
      </Typography>
      <ReviewGridList cellHeight="auto">
        {mapReviews.map(review => (
          <ReviewImageTile review={review} key={review.id} />
        ))}
      </ReviewGridList>
    </CardContent>
  );
};

export default React.memo(MapSummaryCard);

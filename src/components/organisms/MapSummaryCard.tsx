import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';

import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import PlaceIcon from '@material-ui/icons/Place';
import I18n from '../../utils/I18n';
import Link from 'next/link';
import ButtonBase from '@material-ui/core/ButtonBase';
import PublicIcon from '@material-ui/icons/Public';
import LockIcon from '@material-ui/icons/Lock';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';

import Skeleton from '@material-ui/lab/Skeleton';
import ReviewGridList from './ReviewGridList';
import ReviewImageTile from './ReviewImageTile';
import FollowerAvatars from '../molecules/FollowerAvatars';
import VoterAvatars from '../molecules/VoterAvatars';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { format } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    text: {
      wordBreak: 'break-all'
    },
    description: {
      wordBreak: 'break-all',
      whiteSpace: 'pre-wrap'
    },
    chip: {
      marginBottom: theme.spacing(2),
      marginRight: 12
    },
    avatarsContainer: {
      marginBottom: theme.spacing(2),
      cursor: 'pointer'
    }
  })
);

const parseDate = date => {
  return format(new Date(date), 'yyyy-MM-dd', {
    locale: I18n.locale.includes('ja') ? ja : enUS
  });
};

type MapTypesProps = {
  currentMap: any;
};

const MapTypes = React.memo((props: MapTypesProps) => {
  const { currentMap } = props;
  const classes = useStyles();

  const mapTypes = [];

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
        className={classes.chip}
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
        className={classes.chip}
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
        className={classes.chip}
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
        className={classes.chip}
      />
    );
  }

  return mapTypes as any;
});

const MapSummaryCard = () => {
  const classes = useStyles();

  const mapState = useCallback(
    state => ({
      currentMap: state.mapSummary.currentMap,
      mapReviews: state.mapSummary.mapReviews
    }),
    []
  );
  const { currentMap, mapReviews } = useMappedState(mapState);

  return (
    <CardContent>
      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {I18n.t('map name')}
      </Typography>
      {currentMap ? (
        <Typography variant="h5" gutterBottom className={classes.text}>
          {currentMap.name}
        </Typography>
      ) : (
        <Skeleton height={32} width="80%" />
      )}

      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {I18n.t('owner')}
      </Typography>
      <Link href={currentMap ? `/users/${currentMap.owner_id}` : '/'} passHref>
        <ButtonBase title={currentMap && currentMap.owner_name}>
          <Chip
            avatar={
              currentMap && currentMap.owner_image_url ? (
                <Avatar
                  src={currentMap && currentMap.owner_image_url}
                  alt={currentMap && currentMap.owner_name}
                  imgProps={{
                    loading: 'lazy'
                  }}
                />
              ) : (
                <Avatar alt={currentMap && currentMap.owner_name}>
                  {currentMap && currentMap.owner_name.slice(0, 1)}
                </Avatar>
              )
            }
            label={currentMap && currentMap.owner_name}
            className={classes.chip}
            clickable
          />
        </ButtonBase>
      </Link>

      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {I18n.t('description')}
      </Typography>
      {currentMap ? (
        <Typography
          variant="subtitle1"
          gutterBottom
          className={classes.description}
        >
          {currentMap.description}
        </Typography>
      ) : (
        <>
          <Skeleton height={32} width="100%" />
          <Skeleton height={32} width="100%" />
        </>
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
        className={classes.chip}
      />

      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {I18n.t('last reported date')}
      </Typography>
      {currentMap ? (
        <Typography variant="subtitle1" gutterBottom className={classes.text}>
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
        <Typography variant="subtitle1" gutterBottom className={classes.text}>
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
        <>
          <Chip
            avatar={<Skeleton variant="circle" width={24} height={24} />}
            className={classes.chip}
          />
          <Chip
            avatar={<Skeleton variant="circle" width={24} height={24} />}
            className={classes.chip}
          />
        </>
      )}

      <Typography variant="subtitle2" gutterBottom color="textSecondary">
        {`${currentMap ? currentMap.followers_count : 0} ${I18n.t(
          'followers count'
        )}`}
      </Typography>
      <div className={classes.avatarsContainer}>
        {currentMap ? (
          <FollowerAvatars />
        ) : (
          <Skeleton variant="circle" width={40} height={40} />
        )}
      </div>

      {currentMap && currentMap.likes_count > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom color="textSecondary">
            {`${currentMap.likes_count} ${I18n.t('like users')}`}
          </Typography>
          <div className={classes.avatarsContainer}>
            <VoterAvatars />
          </div>
        </>
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

import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import Avatar from '@material-ui/core/Avatar';
import {
  useTheme,
  useMediaQuery,
  makeStyles,
  Theme,
  createStyles
} from '@material-ui/core';
import ReviewLink from '../molecules/ReviewLink';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import { useLocale } from '../../hooks/useLocale';
import { useRouter } from 'next/router';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    activityText: {
      paddingRight: theme.spacing(4),
      fontSize: 14
    },
    secondaryAvatar: {
      marginRight: 12,
      cursor: 'pointer'
    },
    subheader: {
      height: 36
    }
  })
);

const MapReviewsList = () => {
  const classes = useStyles();
  const router = useRouter();
  const { I18n } = useLocale();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mapReviews = useMappedState(
    useCallback(state => state.mapSummary.mapReviews, [])
  );

  return (
    <List
      subheader={
        smUp && (
          <ListSubheader className={classes.subheader}>
            {I18n.t('timeline')}
          </ListSubheader>
        )
      }
    >
      {mapReviews.map(review => (
        <ReviewLink review={review} key={review.id}>
          <ListItem button>
            <ListItemAvatar>
              {review.author.profile_image_url ? (
                <Avatar
                  src={review.author.profile_image_url}
                  alt={review.author.name}
                  imgProps={{
                    loading: 'lazy'
                  }}
                />
              ) : (
                <Avatar alt={review.author.name}>
                  {review.author.name.slice(0, 1)}
                </Avatar>
              )}
            </ListItemAvatar>
            <ListItemText
              primary={
                <div className={classes.activityText}>
                  <b>{review.author.name}</b> {I18n.t('created a report about')}
                  <b>{review.spot.name}</b>
                </div>
              }
              secondary={formatDistanceToNow(new Date(review.created_at), {
                addSuffix: true,
                locale: router.locale === 'ja' ? ja : enUS
              })}
            />
            {review.images.length > 0 && (
              <ListItemSecondaryAction>
                <ReviewLink review={review}>
                  <Avatar
                    src={review.images[0].thumbnail_url}
                    variant="rounded"
                    className={classes.secondaryAvatar}
                    alt={review.spot.name}
                    imgProps={{
                      loading: 'lazy'
                    }}
                  />
                </ReviewLink>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        </ReviewLink>
      ))}
    </List>
  );
};

export default React.memo(MapReviewsList);

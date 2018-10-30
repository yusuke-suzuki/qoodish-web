import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import moment from 'moment';
import I18n from '../containers/I18n';
import ListSubheader from '@material-ui/core/ListSubheader';

const styles = {
  activityText: {
    paddingRight: 32,
    fontSize: 14
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12,
    cursor: 'pointer'
  },
  subheader: {
    height: 36
  }
};

const fromNow = (review) => {
  return moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(window.currentLocale)
    .format('LL');
}

const Reviews = (props) => {
  return props.mapReviews.map(review => (
    <ListItem
      button
      key={review.id}
      onClick={() => props.handleReviewClick(review)}
    >
      <Avatar
        src={review.author.profile_image_url}
        alt={review.author.name}
      />
      <ListItemText
        primary={
          <div style={styles.activityText}>
            <b>{review.author.name}</b> {I18n.t('created a report about')}
            <b>{review.spot.name}</b>
          </div>
        }
        secondary={fromNow(review)}
      />
      {review.image && (
        <ListItemSecondaryAction onClick={() => props.handleReviewClick(review)}>
          <Avatar
            src={review.image.thumbnail_url}
            style={styles.secondaryAvatar}
            alt={review.spot.name}
          />
        </ListItemSecondaryAction>
      )}
    </ListItem>
  ));
}

const MapReviewsList = (props) => {
  return (
    <List
      subheader={props.large &&
        <ListSubheader style={styles.subheader}>{I18n.t('timeline')}</ListSubheader>
      }
    >
      <Reviews {...props} />
    </List>
  );
}

export default MapReviewsList;

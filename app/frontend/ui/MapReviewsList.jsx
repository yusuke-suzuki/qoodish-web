import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import moment from 'moment';
import I18n from '../containers/I18n';
import ListSubheader from '@material-ui/core/ListSubheader';
import Chip from '@material-ui/core/Chip';
import PersonIcon from '@material-ui/icons/Person';

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
  },
  skeltonTextPrimary: {
    width: '100%',
    height: '1.5rem'
  },
  skeltonTextSecondary: {
    width: '50%',
    height: '0.875rem'
  }
};

export default class MapReviewsList extends React.PureComponent {
  render() {
    return (
      <List
        subheader={this.props.large &&
          <ListSubheader style={styles.subheader}>{I18n.t('timeline')}</ListSubheader>
        }
      >
        {this.props.mapReviews.length > 0 ? this.renderReviews(this.props.mapReviews) : this.renderSkeltonReviews()}
      </List>
    );
  }

  renderSkeltonReviews() {
    return [...Array(8).keys()].map(i => (
      <ListItem key={i}>
        <Avatar>
          <PersonIcon />
        </Avatar>
        <ListItemText
          primary={
            <div style={styles.activityText}>
              <Chip style={styles.skeltonTextPrimary} />
            </div>
          }
          secondary={<Chip style={styles.skeltonTextSecondary} />}
        />
      </ListItem>
    ));
  }

  renderReviews(mapReviews) {
    return mapReviews.map(review => (
      <ListItem
        button
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
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
          secondary={this.fromNow(review)}
        />
        {review.image && (
          <ListItemSecondaryAction onClick={() => this.props.handleReviewClick(review)}>
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

  fromNow(review) {
    return moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
      .locale(window.currentLocale)
      .format('LL');
  }
}

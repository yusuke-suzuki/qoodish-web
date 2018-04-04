import React, { Component } from 'react';
import Typography from 'material-ui/Typography';
import { CircularProgress } from 'material-ui/Progress';
import List, {
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import NotificationsIcon from 'material-ui-icons/Notifications';
import Paper from 'material-ui/Paper';
import moment from 'moment';

const styles = {
  containerLarge: {
    margin: '94px auto 200px',
    width: '40%'
  },
  containerSmall: {
    margin: '56px auto 56px'
  },
  progress: {
    textAlign: 'center',
    paddingTop: 40
  },
  noContentsContainer: {
    textAlign: 'center',
    color: '#9e9e9e',
    paddingTop: 40
  },
  noContentsIcon: {
    width: 150,
    height: 150
  },
  notificationText: {
    paddingRight: 32
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12
  }
};

class Notifications extends Component {
  componentWillMount() {
    this.props.handleMount();
    this.props.readNotifications(this.props.notifications);
    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/notifications',
      'page_title': 'Notifications | Qoodish'
    });
  }

  render() {
    return (
      <div
        style={this.props.large ? styles.containerLarge : styles.containerSmall}
      >
        {this.props.loadingNotifications
          ? this.renderProgress()
          : this.renderNotificationsContainer()}
      </div>
    );
  }

  renderNotificationsContainer() {
    if (this.props.notifications.length > 0) {
      return (
        <Paper>
          <List>
            {this.renderNotifications(this.props.notifications)}
          </List>
        </Paper>
      );
    } else {
      return this.renderNoContent();
    }
  }

  renderNotifications(notifications) {
    return notifications.map(notification => (
      <ListItem
        onClick={() => {
          this.props.handleNotificationClick(notification);
        }}
        key={notification.id}
      >
        <Avatar src={notification.notifier.profile_image_url} />
        <ListItemText
          primary={this.renderNotificationText(notification)}
          secondary={
            <div>{this.fromNow(notification)}</div>
          }
          disableTypography
        />
        {notification.notifiable.thumbnail_url && (
          <ListItemSecondaryAction>
            <Avatar src={notification.notifiable.thumbnail_url} style={styles.secondaryAvatar} />
          </ListItemSecondaryAction>
        )}
      </ListItem>
    ));
  }

  renderNotificationText(notification) {
    if (notification.key == 'invited') {
      return (
        <div style={styles.notificationText}>
          <b>{notification.notifier.name}</b> {notification.key} you to{' '}
          {notification.notifiable.type}.
        </div>
      );
    } else {
      return (
        <div style={styles.notificationText}>
          <b>{notification.notifier.name}</b> {notification.key} your{' '}
          {notification.notifiable.type}.
        </div>
      );
    }
  }

  fromNow(notification) {
    return moment(notification.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
      .locale(window.currentLocale)
      .fromNow();
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  renderNoContent() {
    return (
      <div style={styles.noContentsContainer}>
        <NotificationsIcon style={styles.noContentsIcon} />
        <Typography variant="subheading" color="inherit">
          No notifications.
        </Typography>
      </div>
    );
  }
}

export default Notifications;
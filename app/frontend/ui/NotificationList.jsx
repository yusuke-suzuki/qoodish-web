import React from 'react';
import moment from 'moment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../containers/I18n';

const styles = {
  notificationText: {
    paddingRight: 32
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12,
    cursor: 'pointer'
  }
};

export default class NotificationList extends React.Component {
  componentWillMount() {
    this.props.readNotifications(this.props.notifications);
  }

  render() {
    return (
      <List>
        {this.renderNotifications(this.props.notifications)}
      </List>
    );
  }

  renderNotifications(notifications) {
    return notifications.map(notification => (
      <ListItem
        onClick={() => {
          this.props.handleNotificationClick(notification);
        }}
        key={notification.id}
        button
      >
        <Avatar src={notification.notifier.profile_image_url} />
        <ListItemText
          primary={this.renderNotificationText(notification)}
          secondary={
            <div>{this.fromNow(notification)}</div>
          }
        />
        {notification.notifiable.thumbnail_url && (
          <ListItemSecondaryAction
            onClick={() => {
              this.props.handleNotificationClick(notification);
            }}
          >
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
          <b>{notification.notifier.name}</b> {I18n.t(notification.key)}
        </div>
      );
    } else {
      return (
        <div style={styles.notificationText}>
          <b>{notification.notifier.name}</b> {I18n.t(notification.key)}
        </div>
      );
    }
  }

  fromNow(notification) {
    return moment(notification.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
      .locale(window.currentLocale)
      .fromNow();
  }
}

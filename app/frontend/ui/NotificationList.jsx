import React from 'react';
import moment from 'moment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../containers/I18n';
import { Link } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';

const styles = {
  notificationText: {
    paddingRight: 16
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12,
    cursor: 'pointer'
  }
};

export default class NotificationList extends React.PureComponent {
  componentDidMount() {
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
        key={notification.id}
        button
        component={Link}
        to={notification.click_action}
      >
        <Avatar
          src={notification.notifier.profile_image_url}
          alt={notification.notifier.name}
        />
        <ListItemText
          primary={
            <div style={styles.notificationText}>
              {this.renderNotificationText(notification)}
            </div>
          }
          secondary={
            <div>{this.fromNow(notification)}</div>
          }
        />
        {notification.notifiable.thumbnail_url && (
          <ListItemSecondaryAction>
            <ButtonBase component={Link} to={notification.click_action}>
              <Avatar src={notification.notifiable.thumbnail_url} style={styles.secondaryAvatar} />
            </ButtonBase>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    ));
  }

  renderNotificationText(notification) {
    switch (notification.key) {
      case 'comment':
        return (
          <React.Fragment>
            <b>{notification.notifier.name}</b>
            {` ${I18n.t('posted comment')}`}
          </React.Fragment>
        );
      default:
        return (
          <React.Fragment>
            <b>{notification.notifier.name}</b>
            {` ${I18n.t(notification.key)}`}
          </React.Fragment>
        );
    }
  }

  fromNow(notification) {
    return moment(notification.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
      .locale(window.currentLocale)
      .fromNow();
  }
}

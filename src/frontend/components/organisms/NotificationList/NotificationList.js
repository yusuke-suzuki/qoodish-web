import React from 'react';
import moment from 'moment';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../../../utils/I18n';
import { Link } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';

const styles = {
  listItemText: {
    paddingRight: 32
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12,
    cursor: 'pointer'
  },
  notificationMenuItem: {
    height: 'auto',
    whiteSpace: 'initial'
  }
};

const Item = props => {
  if (props.menu) {
    return <MenuItem {...props} />;
  } else {
    return <ListItem {...props} />;
  }
};

export default class NotificationList extends React.PureComponent {
  componentDidMount() {
    this.props.readNotifications(this.props.notifications);
  }

  render() {
    return this.props.notifications.map(notification => (
      <Item
        key={notification.id}
        onClick={this.props.handleNotificationClick}
        button
        component={Link}
        to={notification.click_action}
        item={this.props.item}
        style={this.props.menu ? styles.notificationMenuItem : {}}
      >
        <Avatar
          src={notification.notifier.profile_image_url}
          alt={notification.notifier.name}
        />
        <ListItemText
          style={styles.listItemText}
          primary={
            <Typography variant="subtitle1">
              {this.renderNotificationText(notification)}
            </Typography>
          }
          secondary={
            <Typography variant="subtitle1" color="textSecondary">
              {this.fromNow(notification)}
            </Typography>
          }
          disableTypography
        />
        {notification.notifiable.thumbnail_url && (
          <ListItemSecondaryAction onClick={this.props.handleNotificationClick}>
            <ButtonBase component={Link} to={notification.click_action}>
              <Avatar
                src={notification.notifiable.thumbnail_url}
                style={styles.secondaryAvatar}
              />
            </ButtonBase>
          </ListItemSecondaryAction>
        )}
      </Item>
    ));
  }

  renderNotificationText(notification) {
    switch (notification.key) {
      case 'liked':
        return (
          <React.Fragment>
            <b>{notification.notifier.name}</b>
            {` ${I18n.t(
              `${notification.key} ${notification.notifiable.type}`
            )}`}
          </React.Fragment>
        );
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

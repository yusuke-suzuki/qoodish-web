import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import NotificationsIcon from '@material-ui/icons/Notifications';
import moment from 'moment';
import Badge from '@material-ui/core/Badge';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import I18n from '../containers/I18n';

const styles = {
  listItemContent: {
    overflow: 'hidden'
  },
  notificationText: {
    paddingRight: 32,
    fontSize: 14
  },
  fromNow: {
    fontSize: 14
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12
  },
  notificationMenu: {
    maxHeight: '50vh'
  },
  notificationMenuItem: {
    height: 'auto',
    whiteSpace: 'initial'
  },
  notificationButton: {
    marginRight: 10
  },
  noContentsContainer: {
    textAlign: 'center',
    color: '#9e9e9e',
    height: 'auto',
    display: 'flow-root'
  },
  noContentsIcon: {
    width: 80,
    height: 80
  }
};

class NotificationMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleNotificationButtonClick = this.handleNotificationButtonClick.bind(
      this
    );
    this.handleRequestNotificationClose = this.handleRequestNotificationClose.bind(
      this
    );
    this.state = {
      anchorEl: undefined,
      notificationOpen: false
    };
  }

  componentDidMount() {
    if (!this.props.currentUser || this.props.currentUser.isAnonymous) {
      return;
    }
    this.props.handleMount();
  }

  handleNotificationButtonClick(event) {
    this.setState({
      notificationOpen: true,
      anchorEl: event.currentTarget
    });
  }

  handleRequestNotificationClose(event) {
    this.setState({
      notificationOpen: false
    });
  }

  render() {
    return (
      <div>
        {this.renderNotificationCenter()}
        {this.renderMenu()}
      </div>
    );
  }

  renderNotificationCenter() {
    return (
      <IconButton
        aria-label="Notification"
        aria-owns={this.state.notificationOpen ? 'notification-menu' : null}
        aria-haspopup="true"
        onClick={this.handleNotificationButtonClick}
        style={this.props.large ? styles.notificationButton : {}}
        color="inherit"
      >
        {this.props.unreadNotifications.length > 0 ? (
          <Badge
            badgeContent={this.props.unreadNotifications.length}
            color="secondary"
          >
            <NotificationsIcon />
          </Badge>
        ) : (
          <NotificationsIcon />
        )}
      </IconButton>
    );
  }

  renderMenu() {
    return (
      <Menu
        id="notification-menu"
        anchorEl={this.state.anchorEl}
        open={this.state.notificationOpen}
        onClose={this.handleRequestNotificationClose}
        onEntered={() => this.props.readNotifications(this.props.notifications)}
        PaperProps={{ style: styles.notificationMenu }}
      >
        {this.props.notifications.length > 0
          ? this.renderNotifications(this.props.notifications)
          : this.renderNoNotifications()}
      </Menu>
    );
  }

  renderNoNotifications() {
    return (
      <MenuItem style={styles.noContentsContainer}>
        <NotificationsIcon style={styles.noContentsIcon} />
        <Typography variant="subtitle1" color="inherit">
          {I18n.t('no notifications')}
        </Typography>
      </MenuItem>
    );
  }

  renderNotifications(notifications) {
    return notifications.map(notification => (
      <MenuItem
        onClick={this.handleRequestNotificationClose}
        key={notification.id}
        style={styles.notificationMenuItem}
        component={Link}
        to={notification.click_action}
      >
        <Avatar src={notification.notifier.profile_image_url} />
        <ListItemText
          primary={this.renderNotificationText(notification)}
          secondary={
            <div style={styles.fromNow}>{this.fromNow(notification)}</div>
          }
          style={styles.listItemContent}
          disableTypography
        />
        {notification.notifiable.thumbnail_url && (
          <ListItemSecondaryAction>
            <ButtonBase
              component={Link}
              to={notification.click_action}
              onClick={this.handleRequestNotificationClose}
            >
              <Avatar src={notification.notifiable.thumbnail_url} style={styles.secondaryAvatar} />
            </ButtonBase>
          </ListItemSecondaryAction>
        )}
      </MenuItem>
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

export default NotificationMenu;

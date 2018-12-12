import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';
import I18n from '../containers/I18n';

import NotificationListContainer from '../containers/NotificationListContainer';

const styles = {
  notificationMenu: {
    maxHeight: '50vh'
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
          ? <NotificationListContainer
              notifications={this.props.notifications}
              handleNotificationClick={this.handleRequestNotificationClose}
              menu={true}
            />
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
}

export default NotificationMenu;

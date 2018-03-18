import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import Drawer from 'material-ui/Drawer';
import Button from 'material-ui/Button';
import List, {
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import HomeIcon from 'material-ui-icons/Home';
import ExploreIcon from 'material-ui-icons/Explore';
import MapIcon from 'material-ui-icons/Map';
import SettingsIcon from 'material-ui-icons/Settings';
import MailIcon from 'material-ui-icons/Mail';
import Avatar from 'material-ui/Avatar';
import Menu, { MenuItem } from 'material-ui/Menu';
import NotificationsIcon from 'material-ui-icons/Notifications';
import moment from 'moment';
import Badge from 'material-ui/Badge';
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import Tabs, { Tab } from 'material-ui/Tabs';

const styles = {
  title: {
    cursor: 'pointer'
  },
  toolbarLarge: {
    paddingLeft: 10,
    paddingRight: 10
  },
  navBarIcon: {
    color: 'white'
  },
  logo: {
    cursor: 'pointer',
    color: 'white',
    paddingLeft: 8
  },
  pageTitleLarge: {
    cursor: 'pointer',
    color: 'white',
    borderLeft: '1px solid rgba(255,255,255,0.2)',
    paddingLeft: 24,
    marginLeft: 24
  },
  pageTitleSmall: {
    cursor: 'pointer',
    color: 'white',
    marginLeft: 10
  },
  rightContents: {
    marginLeft: 'auto',
    paddingRight: 10,
    display: 'flex'
  },
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
  },
  tabs: {
    width: '100%'
  },
  tabLarge: {
    height: 64
  },
  tabSmall: {
    height: 56
  },
  profileAvatar: {
    width: 35,
    height: 35,
  },
  menuButton: {
    marginLeft: 8
  }
};

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.handleToggleDrawer = this.handleToggleDrawer.bind(this);
    this.handleCloseDrawer = this.handleCloseDrawer.bind(this);
    this.handleAvatarClick = this.handleAvatarClick.bind(this);
    this.handleRequestAvatarMenuClose = this.handleRequestAvatarMenuClose.bind(
      this
    );
    this.handleNotificationButtonClick = this.handleNotificationButtonClick.bind(
      this
    );
    this.handleRequestNotificationClose = this.handleRequestNotificationClose.bind(
      this
    );

    this.state = {
      drawerOpen: false,
      anchorEl: undefined,
      accountMenuOpen: false,
      notificationOpen: false
    };
  }

  componentWillMount() {
    this.props.handleMount();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.pathname.includes('/reports/') ||
      nextProps.pathname.includes('/maps/') ||
      nextProps.pathname.includes('/spots/')
    ) {
      this.props.showBackButton();
    } else {
      this.props.hideBackButton();
    }
  }

  handleTitleClick() {
    window.location.reload();
  }

  handleAvatarClick(event) {
    this.setState({
      accountMenuOpen: true,
      anchorEl: event.currentTarget
    });
  }

  handleRequestAvatarMenuClose(event) {
    this.setState({
      accountMenuOpen: false
    });
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

  handleToggleDrawer(event) {
    this.setState({
      drawerOpen: !this.state.drawerOpen
    });
  }

  handleCloseDrawer() {
    this.setState({
      drawerOpen: false
    });
  }

  render() {
    return (
      <div>
        <AppBar position="fixed">
          <Toolbar disableGutters style={this.props.large ? styles.toolbarLarge : {}}>
            {!this.props.large && this.props.backButton
              ? this.renderBackButton()
              : this.renderMenuButton()}
            {this.props.large ? this.renderLogo() : null}
            <Typography
              variant="headline"
              color="inherit"
              noWrap
              style={
                this.props.large ? styles.pageTitleLarge : styles.pageTitleSmall
              }
              onClick={this.handleTitleClick}
            >
              {this.props.pageTitle}
            </Typography>
            <div style={styles.rightContents}>
              {this.renderNotificationCenter()}
              {this.renderNotificationMenu()}
              {this.renderAvatar()}
              {this.renderAvatarMenu()}
            </div>
          </Toolbar>
          {this.props.mapsTabActive && this.renderMapsTab()}
          {this.props.mapDetailTabActive && this.renderMapDetailTab()}
        </AppBar>
        <Drawer
          open={this.state.drawerOpen}
          onClose={this.handleCloseDrawer}
          onClick={this.handleCloseDrawer}
        >
          {this.renderDrawerContents()}
        </Drawer>
      </div>
    );
  }

  renderMapsTab() {
    return (
      <Toolbar disableGutters>
        <Tabs
          value={this.props.mapsTabValue}
          fullWidth
          indicatorColor="#fff"
          textColor="inherit"
          centered
          style={styles.tabs}
        >
          <Tab
            label="Following"
            style={this.props.large ? styles.tabLarge : styles.tabSmall}
            onClick={() =>
              this.props.handleFollowingMapsTabClick(this.props.pathname)
            }
          />
          <Tab
            label="My Maps"
            style={this.props.large ? styles.tabLarge : styles.tabSmall}
            onClick={() => this.props.handleMyMapsTabClick(this.props.pathname)}
          />
        </Tabs>
      </Toolbar>
    );
  }

  renderMapDetailTab() {
    return (
      <Toolbar disableGutters>
        <Tabs
          value={this.props.mapDetailTabValue}
          fullWidth
          indicatorColor="#fff"
          textColor="inherit"
          centered
          style={styles.tabs}
        >
          <Tab
            label="SUMMARY"
            style={this.props.large ? styles.tabLarge : styles.tabSmall}
            onClick={() =>
              this.props.handleSummaryTabClick(this.props.pathname)
            }
          />
          <Tab
            label="MAP"
            style={this.props.large ? styles.tabLarge : styles.tabSmall}
            onClick={() => this.props.handleMapTabClick(this.props.pathname)}
          />
        </Tabs>
      </Toolbar>
    );
  }

  renderMenuButton() {
    return (
      <IconButton onClick={this.handleToggleDrawer} style={this.props.large ? {} : styles.menuButton}>
        <MenuIcon style={styles.navBarIcon} />
      </IconButton>
    );
  }

  renderBackButton() {
    return (
      <IconButton onClick={() => this.props.handleBackButtonClick(this.props.previous)}>
        <ArrowBackIcon style={styles.navBarIcon} />
      </IconButton>
    );
  }

  renderLogo() {
    return (
      <Typography
        variant="headline"
        color="inherit"
        style={styles.logo}
        onClick={this.props.requestHome}
      >
        Qoodish
      </Typography>
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

  renderNotificationMenu() {
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
        <Typography variant="subheading" color="inherit">
          No notifications.
        </Typography>
      </MenuItem>
    );
  }

  renderNotifications(notifications) {
    return notifications.map(notification => (
      <MenuItem
        onClick={() => {
          this.handleRequestNotificationClose();
          this.props.handleNotificationClick(notification);
        }}
        key={notification.id}
        style={styles.notificationMenuItem}
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
        {notification.notifiable.image_url && (
          <ListItemSecondaryAction>
            <Avatar src={notification.notifiable.image_url} style={styles.secondaryAvatar} />
          </ListItemSecondaryAction>
        )}
      </MenuItem>
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

  renderAvatar() {
    return (
      <IconButton
        aria-label="Account"
        aria-owns={this.state.accountMenuOpen ? 'account-menu' : null}
        aria-haspopup="true"
        onClick={this.handleAvatarClick}
      >
        <Avatar
          src={this.props.currentUser ? this.props.currentUser.image_url : ''}
          style={styles.profileAvatar}
        />
      </IconButton>
    );
  }

  renderAvatarMenu() {
    return (
      <Menu
        id="account-menu"
        anchorEl={this.state.anchorEl}
        open={this.state.accountMenuOpen}
        onClose={this.handleRequestAvatarMenuClose}
      >
        <MenuItem
          onClick={() => {
            this.handleRequestAvatarMenuClose();
            this.props.requestSettings();
          }}
        >
          Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            this.handleRequestAvatarMenuClose();
            this.props.signOut();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    );
  }

  renderDrawerContents() {
    return (
      <div>
        <List disablePadding>
          <div>
            <ListItem divider={true}>
              <ListItemText
                disableTypography
                primary={this.renderTitle()}
                secondary={this.renderTitleSecondary()}
              />
            </ListItem>
            <ListItem button onClick={this.props.requestHome}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={this.props.requestDiscover}>
              <ListItemIcon>
                <ExploreIcon />
              </ListItemIcon>
              <ListItemText primary="Discover" />
            </ListItem>
            <ListItem button onClick={this.props.requestMaps}>
              <ListItemIcon>
                <MapIcon />
              </ListItemIcon>
              <ListItemText primary="Maps" />
            </ListItem>
            <Divider />
            <ListItem button onClick={this.props.requestSettings}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem button onClick={this.props.requestInvites}>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Invites" />
            </ListItem>
          </div>
        </List>
      </div>
    );
  }

  renderTitle() {
    return (
      <Typography
        variant="headline"
        color="textSecondary"
        style={styles.title}
        onClick={this.props.requestHome}
      >
        Qoodish
      </Typography>
    );
  }

  renderTitleSecondary() {
    return (
      <Typography variant="caption" color="textSecondary">
        {`v${process.env.npm_package_version}`}
      </Typography>
    );
  }
}

export default NavBar;

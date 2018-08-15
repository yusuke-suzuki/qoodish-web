import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import MapIcon from '@material-ui/icons/Map';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import MailIcon from '@material-ui/icons/Mail';
import SendIcon from '@material-ui/icons/Send';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import NotificationsIcon from '@material-ui/icons/Notifications';
import moment from 'moment';
import Badge from '@material-ui/core/Badge';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MapToolbarContainer from '../containers/MapToolbarContainer';
import I18n from '../containers/I18n';

const styles = {
  title: {
    cursor: 'pointer'
  },
  titleLarge: {
    height: 64
  },
  titleSmall: {
    height: 56
  },
  drawerPaper: {
    marginTop: 84,
    zIndex: 1000,
    backgroundColor: 'initial',
    borderRight: 'initial',
    maxWidth: 230
  },
  drawerPaperWithTabs: {
    marginTop: 144,
    zIndex: 1000,
    backgroundColor: 'initial',
    borderRight: 'initial',
    maxWidth: 230
  },
  tabs: {
    width: '100%'
  },
  tabIndicator: {
    backgroundColor: '#fff'
  },
  tabLarge: {
    height: 64
  },
  tabSmall: {
    height: 56
  },
  toolbarLarge: {
    paddingLeft: 10,
    paddingRight: 10
  },
  toolbarSmall: {
    height: 56
  },
  logo: {
    cursor: 'pointer',
    paddingLeft: 8
  },
  pageTitleLarge: {
    cursor: 'pointer',
    borderLeft: '1px solid rgba(255,255,255,0.2)',
    paddingLeft: 24,
    marginLeft: 24
  },
  pageTitleSmall: {
    cursor: 'pointer',
    marginLeft: 8
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
  profileAvatar: {
    width: 35,
    height: 35,
  },
  leftButton: {
    marginLeft: 8
  },
  link: {
    textDecoration: 'none',
    color: 'inherit'
  }
};

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleToggleDrawer = this.handleToggleDrawer.bind(this);
    this.handleOpenDrawer = this.handleOpenDrawer.bind(this);
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
    if (this.props.currentUser.isAnonymous) {
      return;
    }
    this.props.handleMount();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.pathname.includes('/reports/') ||
      nextProps.pathname.includes('/maps/') ||
      nextProps.pathname.includes('/spots/') ||
      nextProps.pathname.includes('/users/')
    ) {
      this.props.showBackButton();
    } else {
      this.props.hideBackButton();
    }
  }

  handleTitleClick() {
    window.scrollTo(0, 0);
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

  handleOpenDrawer() {
    this.setState({
      drawerOpen: true
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
          {this.isMapDetail() && !this.props.large ? this.renderMapToolbar() : this.renderToolbar()}
          {this.props.mapsTabActive && this.renderMapsTab()}
        </AppBar>
        {this.props.large ? this.renderLargeDrawer() : this.renderSwipeableDrawer()}
      </div>
    );
  }

  renderToolbar() {
    return (
      <Toolbar disableGutters style={this.props.large ? styles.toolbarLarge : styles.toolbarSmall}>
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
          {this.props.currentUser && this.props.currentUser.isAnonymous ? this.renderRightContentsForAnonymous() : this.renderRightContents()}
        </div>
      </Toolbar>
    );
  }

  renderRightContents() {
    return (
      <div>
        {this.props.large && this.renderNotificationCenter()}
        {this.renderNotificationMenu()}
        {this.renderAvatar()}
        {this.renderAvatarMenu()}
      </div>
    );
  }

  renderRightContentsForAnonymous() {
    return (
      <div>
        <Button color="inherit" onClick={this.props.requestSignIn}>
          {I18n.t('login')}
        </Button>
      </div>
    );
  }

  renderMapToolbar() {
    return (
      <MapToolbarContainer
        showMapName
        showBackButton
        handleBackButtonClick={this.props.handleBackButtonClick}
      />
    );
  }

  renderLargeDrawer() {
    if (this.sideNavUnnecessary()) {
      return this.renderTemporaryDrawer();
    } else {
      return this.renderPermanentDrawer();
    }
  }

  sideNavUnnecessary() {
    const path = this.props.pathname;
    return (
      this.isMapDetail() ||
      path.includes('/login') ||
      path.includes('/terms') ||
      path.includes('/privacy')
    );
  }

  isMapDetail() {
    return this.props.pathname.includes('/maps/') && !this.props.pathname.includes('/reports');
  }

  renderTemporaryDrawer() {
    return (
      <Drawer
        open={this.state.drawerOpen}
        onClose={this.handleCloseDrawer}
        onClick={this.handleCloseDrawer}
      >
        {this.renderDrawerContents()}
      </Drawer>
    );
  }

  renderPermanentDrawer() {
    return (
      <Drawer
        variant="permanent"
        anchor="left"
        PaperProps={{ style: this.props.mapsTabActive ? styles.drawerPaperWithTabs : styles.drawerPaper }}
        open={this.state.drawerOpen}
        onClose={this.handleCloseDrawer}
        onClick={this.handleCloseDrawer}
      >
        {this.renderDrawerContents()}
      </Drawer>
    );
  }

  renderSwipeableDrawer() {
    return (
      <SwipeableDrawer
        open={this.state.drawerOpen}
        onOpen={this.handleOpenDrawer}
        onClose={this.handleCloseDrawer}
        onClick={this.handleCloseDrawer}
      >
        {this.renderDrawerContents()}
      </SwipeableDrawer>
    );
  }

  renderMapsTab() {
    return (
      <Toolbar disableGutters>
        <Tabs
          value={this.props.mapsTabValue}
          fullWidth
          centered
          style={styles.tabs}
          TabIndicatorProps={{ style: styles.tabIndicator }}
        >
          <Tab
            label={I18n.t('following')}
            style={this.props.large ? styles.tabLarge : styles.tabSmall}
            onClick={this.props.handleFollowingMapsTabClick}
          />
          <Tab
            label={I18n.t('my maps')}
            style={this.props.large ? styles.tabLarge : styles.tabSmall}
            onClick={this.props.handleMyMapsTabClick}
          />
        </Tabs>
      </Toolbar>
    );
  }

  renderMenuButton() {
    return (
      <IconButton
        color="inherit"
        onClick={this.handleToggleDrawer}
        style={this.props.large ? {} : styles.leftButton}
      >
        <MenuIcon />
      </IconButton>
    );
  }

  renderBackButton() {
    return (
      <IconButton
        color="inherit"
        onClick={() => this.props.handleBackButtonClick(this.props.previous)}
        style={this.props.large ? {} : styles.leftButton}
      >
        <ArrowBackIcon />
      </IconButton>
    );
  }

  renderLogo() {
    return (
      <Typography
        variant="headline"
        color="inherit"
        style={styles.logo}
      >
        <Link to="/" style={styles.link}>
          Qoodish
        </Link>
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
          {I18n.t('no notifications')}
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
        {notification.notifiable.thumbnail_url && (
          <ListItemSecondaryAction>
            <Avatar src={notification.notifiable.thumbnail_url} style={styles.secondaryAvatar} />
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

  renderAvatar() {
    return (
      <IconButton
        aria-label="Account"
        aria-owns={this.state.accountMenuOpen ? 'account-menu' : null}
        aria-haspopup="true"
        onClick={this.handleAvatarClick}
      >
        <Avatar
          src={this.props.currentUser ? this.props.currentUser.thumbnail_url : ''}
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
        <MenuItem onClick={this.handleRequestAvatarMenuClose} selected={false}>
          <Link to="/profile" style={styles.link}>
            {I18n.t('account')}
          </Link>
        </MenuItem>
        <MenuItem onClick={this.handleRequestAvatarMenuClose}>
          <Link to="/settings" style={styles.link}>
            {I18n.t('settings')}
          </Link>
        </MenuItem>
        <MenuItem
          onClick={() => {
            this.handleRequestAvatarMenuClose();
            this.props.signOut();
          }}
        >
          {I18n.t('logout')}
        </MenuItem>
      </Menu>
    );
  }

  renderDrawerContents() {
    return (
      <div>
        <List disablePadding>
          <div>
            {!this.props.large || this.sideNavUnnecessary() ? this.renderTitle() : null}
            <Link to="/" style={styles.link}>
              <ListItem button>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary={I18n.t('home')} />
              </ListItem>
            </Link>
            <Link to="/discover" style={styles.link}>
              <ListItem button>
                <ListItemIcon>
                  <ExploreIcon />
                </ListItemIcon>
                <ListItemText primary={I18n.t('discover')} />
              </ListItem>
            </Link>
            <Link to="/maps" style={styles.link}>
              <ListItem button>
                <ListItemIcon>
                  <MapIcon />
                </ListItemIcon>
                <ListItemText primary={I18n.t('maps')} />
              </ListItem>
            </Link>
            <Link to="/profile" style={styles.link}>
              <ListItem button>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary={I18n.t('account')} />
              </ListItem>
            </Link>
            <Link to="/notifications" style={styles.link}>
              <ListItem button>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary={I18n.t('notifications')} />
              </ListItem>
            </Link>
            <Divider />
            <Link to="/settings" style={styles.link}>
              <ListItem button>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary={I18n.t('settings')} />
              </ListItem>
            </Link>
            <Link to="/invites" style={styles.link}>
              <ListItem button>
                <ListItemIcon>
                  <MailIcon />
                </ListItemIcon>
                <ListItemText primary={I18n.t('invites')} />
              </ListItem>
            </Link>
            <Divider />
            <ListItem button onClick={this.props.handleFeedbackClick}>
              <ListItemText primary={I18n.t('send feedback')} />
            </ListItem>
            <Link to="/terms" style={styles.link}>
              <ListItem button>
                <ListItemText primary={I18n.t('terms of service')} />
              </ListItem>
            </Link>
            <Link to="/privacy" style={styles.link}>
              <ListItem button>
                <ListItemText primary={I18n.t('privacy policy')} />
              </ListItem>
            </Link>
          </div>
        </List>
      </div>
    );
  }

  renderTitle() {
    return (
      <ListItem divider={true} style={this.props.large ? styles.titleLarge : styles.titleSmall}>
        <ListItemText
          disableTypography
          primary={
            <Typography
              variant="headline"
              color="textSecondary"
              style={styles.title}
              onClick={this.props.requestHome}
            >
              Qoodish
            </Typography>
          }
        />
      </ListItem>
    );
  }
}

export default NavBar;

import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import Drawer from 'material-ui/Drawer';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import HomeIcon from 'material-ui-icons/Home';
import TimelineIcon from 'material-ui-icons/Timeline';
import SettingsIcon from 'material-ui-icons/Settings';
import Avatar from 'material-ui/Avatar';
import Menu, { MenuItem } from 'material-ui/Menu';

const styles = {
  title: {
    cursor: 'pointer'
  },
  toolbar: {
    paddingLeft: 10,
    paddingRight: 10
  },
  menuButton: {
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
    paddingRight: 10
  }
};

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.handleToggleDrawer = this.handleToggleDrawer.bind(this);
    this.handleCloseDrawer = this.handleCloseDrawer.bind(this);
    this.handleAvatarClick = this.handleAvatarClick.bind(this);
    this.handleRequestAvatarMenuClose = this.handleRequestAvatarMenuClose.bind(this);

    this.state = {
      drawerOpen: false,
      anchorEl: undefined,
      accountMenuOpen: false
    };
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
        <AppBar position='fixed'>
          <Toolbar disableGutters style={styles.toolbar}>
            <IconButton color='contrast' onClick={this.handleToggleDrawer}>
              <MenuIcon style={styles.menuButton} />
            </IconButton>
            {this.props.large ? this.renderLogo() : null}
            <Typography
              type='headline'
              color='inherit'
              style={this.props.large ? styles.pageTitleLarge : styles.pageTitleSmall}
              onClick={this.handleTitleClick}
            >
              {this.props.pageTitle}
            </Typography>
            <div style={styles.rightContents}>
              {this.renderAvatarMenu()}
            </div>
          </Toolbar>
        </AppBar>
        <Drawer
          open={this.state.drawerOpen}
          onRequestClose={this.handleCloseDrawer}
          onClick={this.handleCloseDrawer}
          docked={false}
        >
          {this.renderDrawerContents()}
        </Drawer>
      </div>
    );
  }

  renderLogo() {
    return (
      <Typography type='headline' color='inherit' style={styles.logo} onClick={this.props.requestHome}>
        Qoodish
      </Typography>
    );
  }

  renderAvatarMenu() {
    return (
      <div>
        <IconButton
          aria-label='Account'
          aria-owns={this.state.accountMenuOpen ? 'account-menu' : null}
          aria-haspopup='true'
          onClick={this.handleAvatarClick}
        >
          <Avatar src={this.props.currentUser ? this.props.currentUser.image_url : ''} />
        </IconButton>
        <Menu
          id='account-menu'
          anchorEl={this.state.anchorEl}
          open={this.state.accountMenuOpen}
          onRequestClose={this.handleRequestAvatarMenuClose}
        >
          <MenuItem onClick={this.props.requestSettings}>Settings</MenuItem>
          <MenuItem onClick={this.props.signOut}>Logout</MenuItem>
        </Menu>
      </div>
    );
  }

  renderDrawerContents() {
    return (
      <div>
        <List disablePadding>
          <div>
            <ListItem divider={true}>
              <ListItemText disableTypography primary={this.renderTitle()} secondary={this.renderTitleSecondary()} />
            </ListItem>
            <ListItem button onClick={this.props.requestHome}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary='Home' />
            </ListItem>
            <ListItem button onClick={this.props.requestTimeline}>
              <ListItemIcon>
                <TimelineIcon />
              </ListItemIcon>
              <ListItemText primary='Timeline' />
            </ListItem>
            <ListItem button onClick={this.props.requestSettings}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary='Settings' />
            </ListItem>
          </div>
        </List>
      </div>
    );
  }

  renderTitle() {
    return (
      <Typography type='headline' color='secondary' style={styles.title} onClick={this.props.requestHome}>
        Qoodish
      </Typography>
    );
  }

  renderTitleSecondary() {
    return (
      <Typography type='caption' color='secondary'>
        {`v${process.env.npm_package_version}`}
      </Typography>
    );
  }
}

export default NavBar;

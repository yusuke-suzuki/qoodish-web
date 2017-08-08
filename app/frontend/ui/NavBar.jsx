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
import Hidden from 'material-ui/Hidden';
import Avatar from 'material-ui/Avatar';
import Menu, { MenuItem } from 'material-ui/Menu';

const styles = {
  title: {
    cursor: 'pointer'
  },
  menuButton: {
    color: 'white'
  },
  pageTitle: {
    cursor: 'pointer',
    color: 'white'
  },
  rightContents: {
    marginLeft: 'auto',
    paddingLeft: 30,
    paddingRight: 30
  }
};

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.handleToggleDrawer = this.handleToggleDrawer.bind(this);
    this.handleCloseDrawer = this.handleCloseDrawer.bind(this);
    this.handleHomeClick = this.handleHomeClick.bind(this);
    this.handleAvatarClick = this.handleAvatarClick.bind(this);
    this.handleRequestAvatarMenuClose = this.handleRequestAvatarMenuClose.bind(this);

    this.state = {
      drawerOpen: false,
      anchorEl: undefined,
      accountMenuOpen: false
    };
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

  handleCloseDrawer(event) {
    this.setState({
      drawerOpen: false
    });
  }

  handleHomeClick() {
    this.props.requestHome();
  }

  render() {
    return (
      <div>
        <AppBar position='fixed'>
          <Toolbar disableGutters>
            <IconButton color='contrast' onClick={this.handleToggleDrawer}>
              <MenuIcon style={styles.menuButton} />
            </IconButton>
            <Typography type='headline' color='inherit' style={styles.pageTitle}>
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

  renderAvatarMenu() {
    return (
      <div>
        <IconButton
          aria-label='Account'
          aria-owns={this.state.accountMenuOpen ? 'account-menu' : null}
          aria-owns='account-menu'
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
            <ListItem button onClick={this.handleHomeClick}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary='Home' />
            </ListItem>
          </div>
        </List>
      </div>
    );
  }

  renderTitle() {
    return (
      <Typography type='headline' color='secondary' style={styles.title} onClick={this.handleHomeClick}>
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

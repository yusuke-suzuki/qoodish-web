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

const styles = {
  title: {
    cursor: 'pointer',
  },
  pageTitle: {
    cursor: 'pointer'
  },
  rightContents: {
    marginLeft: 'auto'
  }
};

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.handleToggleDrawer = this.handleToggleDrawer.bind(this);
    this.handleCloseDrawer = this.handleCloseDrawer.bind(this);
    this.handleHomeClick = this.handleHomeClick.bind(this);

    this.state = {
      drawerOpen: false
    };
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
          <Toolbar>
            <IconButton color='contrast'>
              <MenuIcon onClick={this.handleToggleDrawer} />
            </IconButton>
            <Typography type='headline' color='inherit' style={styles.pageTitle}>
              {this.props.pageTitle}
            </Typography>
            <div style={styles.rightContents}>
              <Button color='contrast' onClick={this.props.signOut}>Logout</Button>
            </div>
          </Toolbar>
        </AppBar>
        <Drawer
          open={this.state.drawerOpen}
          onRequestClose={this.handleCloseDrawer}
          onClick={this.handleCloseDrawer}
          docked
        >
          {this.renderDrawerContents()}
        </Drawer>
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

import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import MapIcon from 'material-ui-icons/Map';
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';
import LockIcon from 'material-ui-icons/Lock';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import CreateMapDialogContainer from '../containers/CreateMapDialogContainer.js';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

const styles = {
  rootLarge: {
    margin: '144px auto 200px',
    width: '80%'
  },
  rootSmall: {
    margin: '104px auto 0'
  },
  tabBarLarge: {
    top: 64
  },
  tabBarSmall: {
    top: 56
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 40,
    marginBottom: 20
  },
  gridList: {
    width: '100%'
  },
  gridTile: {
    cursor: 'pointer'
  },
  lockIcon: {
    marginRight: 10
  },
  createButtonLarge: {
    position: 'fixed',
    zIndex: 2,
    bottom: 32,
    right: 32,
    backgroundColor: 'red',
    color: 'white'
  },
  createButtonSmall: {
    position: 'fixed',
    zIndex: 2,
    bottom: 20,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  noContentsContainer: {
    textAlign: 'center',
    color: '#9e9e9e',
    marginTop: 20
  },
  noContentsIcon: {
    width: 150,
    height: 150
  },
  gridHeader: {
    width: '100%',
    display: 'inline-flex',
    marginBottom: 15
  },
  mapTypeIcon: {
    marginLeft: 10,
    marginRight: 10
  },
  raisedButtonLarge: {
    width: '100%',
    marginBottom: 20
  },
  raisedButtonSmall: {
    width: '90%',
    marginBottom: 20
  }
};

export default class Maps extends Component {
  componentWillMount() {
    this.props.updatePageTitle();
    this.props.refreshMyMaps();
    this.props.refreshFollowingMaps();
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      value: 0
    };
  }

  handleChange(event, value) {
    this.setState({ value });
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        <AppBar position='fixed' style={this.props.large ? styles.tabBarLarge : styles.tabBarSmall}>
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            fullWidth
            indicatorColor='accent'
            textColor='accent'
            centered
          >
            <Tab label='Following' />
            <Tab label='My Maps' />
          </Tabs>
        </AppBar>
        {this.state.value === 0 && this.renderFollowingMaps()}
        {this.state.value === 1 && this.renderMyMaps()}
        <Button
          fab
          aria-label='add'
          style={this.props.large ? styles.createButtonLarge : styles.createButtonSmall}
          onClick={this.props.handleCreateMapButtonClick}
        >
          <AddIcon />
        </Button>
        <CreateMapDialogContainer />
      </div>
    );
  }

  renderFollowingMaps() {
    return (
      <div style={styles.container}>
        {this.props.loadingFollowingMaps ? this.renderProgress() : this.renderMapContainer(this.props.followingMaps)}
      </div>
    );
  }

  renderMyMaps() {
    return (
      <div style={styles.container}>
        {this.props.loadingMyMaps ? this.renderProgress() : this.renderMapContainer(this.props.myMaps)}
      </div>
    );
  }

  renderNoMaps() {
    return (
      <div style={styles.noContentsContainer}>
        <MapIcon style={styles.noContentsIcon} />
        <Typography type='subheading' color='inherit'>
          When you create or follow maps, you will see maps here.
        </Typography>
        <br/>
        <Button raised onClick={this.props.handleCreateMapButtonClick} style={this.props.large ? styles.raisedButtonLarge : styles.raisedButtonSmall}>
          Create New Map
        </Button>
        <Button raised onClick={this.props.handleHomeLinkClick} style={this.props.large ? styles.raisedButtonLarge : styles.raisedButtonSmall}>
          Search Maps
        </Button>
      </div>
    );
  }

  renderMapContainer(maps) {
    if (maps.length > 0) {
      return (
        <GridList
          cols={this.props.large ? 4 : 2}
          style={styles.gridList}
          spacing={this.props.large ? 20 : 0}
        >
          {this.renderMaps(maps)}
        </GridList>
      );
    } else {
      return this.renderNoMaps();
    }
  }

  renderMaps(maps) {
    return maps.map((map) => (
      <GridListTile
        key={map.id}
        onClick={() => this.props.handleClickMap(map)}
        style={styles.gridTile}
      >
        <img src={map.image_url} />
        <GridListTileBar
          title={map.name}
          subtitle={
            <span>
              by: {map.owner_name}
            </span>
          }
          actionIcon={
            map.private ? <LockIcon color='rgba(255, 255, 255, 0.54)' style={styles.lockIcon} /> : null
          }
        />
      </GridListTile>
    ));
  }
}

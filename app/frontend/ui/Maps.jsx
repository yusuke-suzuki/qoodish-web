import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import MapIcon from 'material-ui-icons/Map';
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';
import LockIcon from 'material-ui-icons/Lock';
import GroupIcon from 'material-ui-icons/Group';
import PersonIcon from 'material-ui-icons/Person';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import Typography from 'material-ui/Typography';

const styles = {
  rootLarge: {
    margin: '144px auto 200px',
    width: '80%'
  },
  rootSmall: {
    margin: '120px auto 64px'
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
    bottom: 76,
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
    padding: 20
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
    marginLeft: 16,
    marginRight: 16,
    color: '#fff',
    fontSize: '1.2rem'
  },
  mapTypeContainer: {
    display: 'grid'
  }
};

export default class Maps extends Component {
  componentWillMount() {
    this.props.showTabs();
    this.props.updatePageTitle();
    this.props.refreshMyMaps();
    this.props.refreshFollowingMaps();

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/maps',
      'page_title': 'Maps | Qoodish'
    });
  }

  componentWillUnmount() {
    this.props.hideTabs();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hash) {
      if (nextProps.hash === '#mymaps') {
        nextProps.switchMyMaps();
      } else if (nextProps.hash === '#following') {
        nextProps.switchFollowingMaps();
      }
    } else {
      nextProps.switchFollowingMaps();
    }
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
        {this.props.tabValue === 0 && this.renderFollowingMaps()}
        {this.props.tabValue === 1 && this.renderMyMaps()}
        <Button
          variant="fab"
          aria-label="add"
          style={
            this.props.large
              ? styles.createButtonLarge
              : styles.createButtonSmall
          }
          onClick={this.props.handleCreateMapButtonClick}
        >
          <AddIcon />
        </Button>
      </div>
    );
  }

  renderFollowingMaps() {
    return (
      <div style={styles.container}>
        {this.props.loadingFollowingMaps
          ? this.renderProgress()
          : this.renderMapContainer(this.props.followingMaps)}
      </div>
    );
  }

  renderMyMaps() {
    return (
      <div style={styles.container}>
        {this.props.loadingMyMaps
          ? this.renderProgress()
          : this.renderMapContainer(this.props.myMaps)}
      </div>
    );
  }

  renderNoMaps() {
    return (
      <div style={styles.noContentsContainer}>
        <MapIcon style={styles.noContentsIcon} />
        <Typography variant="subheading" color="inherit">
          When you create or follow maps, you will see maps here.
        </Typography>
        <br />
        <Button
          variant="raised"
          color="primary"
          onClick={this.props.handleCreateMapButtonClick}
        >
          Create New Map
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
          spacing={this.props.large ? 20 : 10}
        >
          {this.renderMaps(maps)}
        </GridList>
      );
    } else {
      return this.renderNoMaps();
    }
  }

  renderMaps(maps) {
    return maps.map(map => (
      <GridListTile
        key={map.id}
        onClick={() => this.props.handleClickMap(map)}
        style={styles.gridTile}
      >
        <img src={map.image_url} />
        <GridListTileBar
          title={map.name}
          subtitle={<span>by: {map.owner_name}</span>}
          actionIcon={<div style={styles.mapTypeContainer}>{this.renderMapTypeIcon(map)}</div>}
        />
      </GridListTile>
    ));
  }

  renderMapTypeIcon(map) {
    let actions = [];
    if (map.private) {
      actions.push(<LockIcon style={styles.mapTypeIcon} />);
    }
    if (map.shared) {
      actions.push(<GroupIcon style={styles.mapTypeIcon} />);
    } else {
      actions.push(<PersonIcon style={styles.mapTypeIcon} />);
    }
    return actions;
  }
}

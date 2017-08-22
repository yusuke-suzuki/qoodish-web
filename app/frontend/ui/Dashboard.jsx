import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import MapIcon from 'material-ui-icons/Map';
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';
import LockIcon from 'material-ui-icons/Lock';
import GroupIcon from 'material-ui-icons/Group';
import TrendingUpIcon from 'material-ui-icons/TrendingUp';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import CreateMapDialogContainer from '../containers/CreateMapDialogContainer.js';
import Typography from 'material-ui/Typography';

const styles = {
  root: {
    margin: '104px auto 200px',
    width: '80%'
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
  createButton: {
    position: 'fixed',
    zIndex: 2,
    bottom: 32,
    right: 32,
    backgroundColor: 'red',
    color: 'white'
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  noMapsContainer: {
    textAlign: 'center',
    color: '#9e9e9e',
    marginTop: 20
  },
  noMapsIcon: {
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
  }
};

export default class Dashboard extends Component {
  componentWillMount() {
    this.props.updatePageTitle();
    this.props.refreshMaps();
    this.props.refreshPopularMaps();
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
      <div style={styles.root}>
        <div style={styles.container}>
          <Typography type='subheading' gutterBottom color='secondary' style={styles.gridHeader}>
            <GroupIcon style={styles.mapTypeIcon} /> Maps you currently joined
          </Typography>
          <br/>
          {this.props.loadingMaps ? this.renderProgress() : this.renderMapContainer(this.props.currentMaps)}
        </div>
        <div style={styles.container}>
          <Typography type='subheading' gutterBottom color='secondary' style={styles.gridHeader}>
            <TrendingUpIcon style={styles.mapTypeIcon} /> Popular maps
          </Typography>
          {this.props.loadingPopularMaps ? this.renderProgress() : this.renderMapContainer(this.props.popularMaps)}
        </div>
        <Button
          fab
          aria-label='add'
          style={styles.createButton}
          onClick={this.props.handleCreateMapButtonClick}
        >
          <AddIcon />
        </Button>
        <CreateMapDialogContainer />
      </div>
    );
  }

  renderNoMaps() {
    return (
      <div style={styles.noMapsContainer}>
        <MapIcon style={styles.noMapsIcon} />
        <Typography type='subheading' color='inherit'>
          No maps.
        </Typography>
      </div>
    );
  }

  renderMapContainer(maps) {
    if (maps.length > 0) {
      return (
        <GridList
          cols={this.props.large ? 4 : 1}
          style={styles.gridList}
          spacing={20}
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

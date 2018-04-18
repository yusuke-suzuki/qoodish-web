import React from 'react';
import { CircularProgress } from 'material-ui/Progress';
import MapIcon from 'material-ui-icons/Map';
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';
import Typography from 'material-ui/Typography';
import SwipeableViews from 'react-swipeable-views';
import MapCollectionContainer from '../containers/MapCollectionContainer';

const styles = {
  rootLarge: {
    margin: '154px auto 200px',
    maxWidth: 900
  },
  rootSmall: {
    margin: '120px auto 64px'
  },
  container: {
    marginBottom: 20
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
  }
};

export default class Maps extends React.Component {
  constructor(props) {
    super(props);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

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

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  handleTabChange() {
    let currentTabValue = this.props.tabValue;
    if (currentTabValue === 0) {
      this.props.handleMyMapsActive();
    } else {
      this.props.handleFollowingMapsActive();
    }
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        <SwipeableViews index={this.props.tabValue} onChangeIndex={this.handleTabChange}>
          {this.renderFollowingMaps()}
          {this.renderMyMaps()}
        </SwipeableViews>
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
      <div style={styles.container} key='following'>
        {this.props.loadingFollowingMaps
          ? this.renderProgress()
          : this.renderMapContainer(this.props.followingMaps)}
      </div>
    );
  }

  renderMyMaps() {
    return (
      <div style={styles.container} key='mymaps'>
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
        <MapCollectionContainer maps={maps} />
      );
    } else {
      return this.renderNoMaps();
    }
  }
}

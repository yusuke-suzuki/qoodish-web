import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import SwipeableViews from 'react-swipeable-views';
import MapCollectionContainer from '../containers/MapCollectionContainer';
import NoContentsContainer from '../containers/NoContentsContainer';
import CreateMapButtonContainer from '../containers/CreateMapButtonContainer';

const styles = {
  rootLarge: {
    marginTop: 154,
    marginBottom: 200
  },
  rootSmall: {
    margin: '120px auto 64px'
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
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
        <SwipeableViews animateHeight index={this.props.tabValue} onChangeIndex={this.handleTabChange}>
          {this.renderFollowingMaps()}
          {this.renderMyMaps()}
        </SwipeableViews>
        <CreateMapButtonContainer />
      </div>
    );
  }

  renderFollowingMaps() {
    return (
      <div key='following'>
        {this.props.loadingFollowingMaps
          ? this.renderProgress()
          : this.renderMapContainer(this.props.followingMaps)}
      </div>
    );
  }

  renderMyMaps() {
    return (
      <div key='mymaps'>
        {this.props.loadingMyMaps
          ? this.renderProgress()
          : this.renderMapContainer(this.props.myMaps)}
      </div>
    );
  }

  renderMapContainer(maps) {
    if (maps.length > 0) {
      return (
        <MapCollectionContainer maps={maps} />
      );
    } else {
      return (
        <NoContentsContainer
          contentType="map"
          action="create-map"
          message="When you create or follow maps, you will see maps here."
        />
      );
    }
  }
}

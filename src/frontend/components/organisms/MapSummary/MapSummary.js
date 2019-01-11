import React from 'react';
import loadable from '@loadable/component';

const MapToolbar = loadable(() =>
  import(/* webpackChunkName: "map_toolbar" */ '../../molecules/MapToolbar')
);
const MapSummaryCard = loadable(() =>
  import(/* webpackChunkName: "map_summary_card" */ '../../molecules/MapSummaryCard')
);
const MapReviewsList = loadable(() =>
  import(/* webpackChunkName: "map_reviews_list" */ '../MapReviewsList')
);
const MapSpotsList = loadable(() =>
  import(/* webpackChunkName: "map_spots_list" */ '../MapSpotsList')
);
const MapFollowersList = loadable(() =>
  import(/* webpackChunkName: "map_followers_list" */ '../MapFollowersList')
);
const FollowMapButton = loadable(() =>
  import(/* webpackChunkName: "follow_map_button" */ '../../molecules/FollowMapButton')
);
const MapLikeActions = loadable(() =>
  import(/* webpackChunkName: "map_like_actions" */ '../../molecules/MapLikeActions')
);

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import TimelineIcon from '@material-ui/icons/Timeline';
import PlaceIcon from '@material-ui/icons/Place';
import GroupIcon from '@material-ui/icons/Group';
import HomeIcon from '@material-ui/icons/Home';
import SwipeableViews from 'react-swipeable-views';
import I18n from '../../../utils/I18n';

const styles = {
  containerLarge: {
    width: 380,
    height: '100%'
  },
  containerSmall: {
    height: '100%'
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  toolbarContainerLarge: {
    position: 'absolute',
    top: 64,
    width: '100%'
  },
  toolbarLarge: {
    height: 64
  },
  toolbarSmall: {
    height: 56
  },
  tabsLarge: {
    height: 64,
    width: '100%'
  },
  tabsSmall: {},
  tabLarge: {
    height: 64,
    minHeight: 64,
    width: '20%',
    minWidth: 'auto',
    paddingTop: 0
  },
  tabSmall: {
    height: 56
  },
  tabContentsLarge: {
    marginTop: 128,
    marginBottom: 64,
    height: 'calc(100% - 192px)'
  },
  tabContentsSmall: {
    marginTop: 112,
    marginBottom: 56,
    height: 'calc(100% - 168px)'
  },
  tabIcon: {
    position: 'absolute'
  },
  followMapButton: {
    marginLeft: 'auto'
  }
};

class MapSummary extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleSwipeChange = this.handleSwipeChange.bind(this);
  }

  handleTabChange(e, value) {
    this.setState({
      tabValue: value
    });
  }

  handleSwipeChange(value) {
    this.setState({
      tabValue: value
    });
  }

  render() {
    return (
      <div
        style={this.props.large ? styles.containerLarge : styles.containerSmall}
      >
        <AppBar position="absolute">
          <MapToolbar
            showBackButton={this.props.large ? false : true}
            showMapName
            showMenuButton={this.props.large ? true : false}
            handleBackButtonClick={() =>
              this.props.large
                ? this.props.handleBackButtonClick(this.props.previousLocation)
                : this.props.handleSummaryClose()
            }
          />
          {!this.props.large && this.renderTabBarSmall()}
        </AppBar>
        {this.renderTabContents()}
        {this.props.large && this.renderTabBarLarge()}
        {this.renderBottomNav()}
      </div>
    );
  }

  renderTabBarLarge() {
    return (
      <Paper style={styles.toolbarContainerLarge} square elevation={1}>
        <Toolbar style={styles.toolbarLarge} disableGutters>
          {this.renderTabs()}
        </Toolbar>
      </Paper>
    );
  }

  renderTabBarSmall() {
    return <Toolbar style={styles.toolbarSmall}>{this.renderTabs()}</Toolbar>;
  }

  renderBottomNav() {
    return (
      <Paper style={styles.bottomNav} square elevation={1}>
        <Toolbar
          style={this.props.large ? styles.toolbarLarge : styles.toolbarSmall}
        >
          <MapLikeActions target={this.props.currentMap} />
          <div style={styles.followMapButton}>
            <FollowMapButton currentMap={this.props.currentMap} />
          </div>
        </Toolbar>
      </Paper>
    );
  }

  renderTabs() {
    return (
      <Tabs
        value={this.state.tabValue}
        onChange={this.handleTabChange}
        style={this.props.large ? styles.tabsLarge : styles.tabsSmall}
        variant={this.props.large ? 'fullWidth' : 'standard'}
        indicatorColor={this.props.large ? 'primary' : 'secondary'}
        textColor={this.props.large ? 'primary' : 'inherit'}
      >
        <Tab
          icon={this.props.large ? <HomeIcon style={styles.tabIcon} /> : null}
          label={this.props.large ? null : I18n.t('basic info')}
          style={this.props.large ? styles.tabLarge : styles.tabSmall}
        />
        <Tab
          icon={
            this.props.large ? <TimelineIcon style={styles.tabIcon} /> : null
          }
          label={this.props.large ? null : I18n.t('timeline')}
          style={this.props.large ? styles.tabLarge : styles.tabSmall}
        />
        <Tab
          icon={this.props.large ? <PlaceIcon style={styles.tabIcon} /> : null}
          label={this.props.large ? null : I18n.t('spots')}
          style={this.props.large ? styles.tabLarge : styles.tabSmall}
        />
        <Tab
          icon={this.props.large ? <GroupIcon style={styles.tabIcon} /> : null}
          label={this.props.large ? null : I18n.t('followers')}
          style={this.props.large ? styles.tabLarge : styles.tabSmall}
        />
      </Tabs>
    );
  }

  renderTabContents() {
    return (
      <SwipeableViews
        index={this.state.tabValue}
        onChangeIndex={this.handleSwipeChange}
        style={
          this.props.large ? styles.tabContentsLarge : styles.tabContentsSmall
        }
      >
        <MapSummaryCard />
        <MapReviewsList />
        <MapSpotsList />
        <MapFollowersList />
      </SwipeableViews>
    );
  }
}

export default MapSummary;

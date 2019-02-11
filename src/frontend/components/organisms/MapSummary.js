import React, { useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import loadable from '@loadable/component';

const MapToolbar = loadable(() =>
  import(/* webpackChunkName: "map_toolbar" */ '../molecules/MapToolbar')
);
const MapSummaryCard = loadable(() =>
  import(/* webpackChunkName: "map_summary_card" */ './MapSummaryCard')
);
const MapReviewsList = loadable(() =>
  import(/* webpackChunkName: "map_reviews_list" */ './MapReviewsList')
);
const FollowMapButton = loadable(() =>
  import(/* webpackChunkName: "follow_map_button" */ '../molecules/FollowMapButton')
);
const MapLikeActions = loadable(() =>
  import(/* webpackChunkName: "map_like_actions" */ '../molecules/MapLikeActions')
);

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import TimelineIcon from '@material-ui/icons/Timeline';
import HomeIcon from '@material-ui/icons/Home';
import SwipeableViews from 'react-swipeable-views';
import I18n from '../../utils/I18n';

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
    height: 64,
    paddingLeft: 10
  },
  toolbarSmall: {
    height: 56,
    paddingLeft: 10
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

const MapBottomNav = React.memo(() => {
  const large = useMediaQuery('(min-width: 600px)');
  const currentMap = useMappedState(
    useCallback(state => state.mapSummary.currentMap, [])
  );

  return (
    <Paper style={styles.bottomNav} square elevation={1}>
      <Toolbar style={large ? styles.toolbarLarge : styles.toolbarSmall}>
        <MapLikeActions target={currentMap} />
        <div style={styles.followMapButton}>
          <FollowMapButton currentMap={currentMap} />
        </div>
      </Toolbar>
    </Paper>
  );
});

const MapTabs = React.memo(props => {
  const large = useMediaQuery('(min-width: 600px)');

  return (
    <Tabs
      value={props.tabValue}
      onChange={props.handleTabChange}
      style={large ? styles.tabsLarge : styles.tabsSmall}
      variant={large ? 'fullWidth' : 'standard'}
      indicatorColor={large ? 'primary' : 'secondary'}
      textColor={large ? 'primary' : 'inherit'}
    >
      <Tab
        icon={large ? <HomeIcon style={styles.tabIcon} /> : null}
        label={large ? null : I18n.t('basic info')}
        style={large ? styles.tabLarge : styles.tabSmall}
      />
      <Tab
        icon={large ? <TimelineIcon style={styles.tabIcon} /> : null}
        label={large ? null : I18n.t('timeline')}
        style={large ? styles.tabLarge : styles.tabSmall}
      />
    </Tabs>
  );
});

const TabContents = React.memo(props => {
  const large = useMediaQuery('(min-width: 600px)');

  return (
    <SwipeableViews
      index={props.tabValue}
      onChangeIndex={props.handleSwipeChange}
      style={large ? styles.tabContentsLarge : styles.tabContentsSmall}
    >
      <MapSummaryCard />
      <MapReviewsList />
    </SwipeableViews>
  );
});

const MapSummary = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const large = useMediaQuery('(min-width: 600px)');

  const handleSwipeChange = useCallback(value => {
    setTabValue(value);
  });

  const handleTabChange = useCallback((e, value) => {
    setTabValue(value);
  });

  return (
    <div style={large ? styles.containerLarge : styles.containerSmall}>
      <AppBar position="absolute">
        <MapToolbar
          showBackButton={large ? false : true}
          showMapName
          showMenuButton={large ? true : false}
        />
        {!large && (
          <Toolbar>
            <MapTabs tabValue={tabValue} handleTabChange={handleTabChange} />
          </Toolbar>
        )}
      </AppBar>
      <TabContents tabValue={tabValue} handleSwipeChange={handleSwipeChange} />
      {large && (
        <Paper style={styles.toolbarContainerLarge} square elevation={1}>
          <Toolbar disableGutters>
            <MapTabs tabValue={tabValue} handleTabChange={handleTabChange} />
          </Toolbar>
        </Paper>
      )}
      <MapBottomNav />
    </div>
  );
};

export default React.memo(MapSummary);

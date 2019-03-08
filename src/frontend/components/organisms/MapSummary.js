import React, { useCallback, useState } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import MapToolbar from '../molecules/MapToolbar';
import MapSummaryCard from './MapSummaryCard';
import MapReviewsList from './MapReviewsList';
import FollowMapButton from '../molecules/FollowMapButton';
import MapLikeActions from '../molecules/MapLikeActions';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import TimelineIcon from '@material-ui/icons/Timeline';
import HomeIcon from '@material-ui/icons/Home';
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
    width: '100%',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
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
    overflowY: 'scroll',
    height: 'calc(100% - 192px)'
  },
  tabContentsSmall: {
    marginTop: 112,
    marginBottom: 56,
    overflowY: 'scroll',
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

const MapSummary = () => {
  const [tabValue, setTabValue] = useState(0);
  const large = useMediaQuery('(min-width: 600px)');

  const handleTabChange = useCallback((e, value) => {
    setTabValue(value);
  });

  return (
    <div style={large ? styles.containerLarge : styles.containerSmall}>
      {!large && (
        <AppBar position="absolute">
          <MapToolbar />
          <Toolbar>
            <MapTabs tabValue={tabValue} handleTabChange={handleTabChange} />
          </Toolbar>
        </AppBar>
      )}
      <div style={large ? styles.tabContentsLarge : styles.tabContentsSmall}>
        {tabValue === 0 && <MapSummaryCard />}
        {tabValue === 1 && <MapReviewsList />}
      </div>
      {large && (
        <Paper style={styles.toolbarContainerLarge} square elevation={0}>
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

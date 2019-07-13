import React, { useCallback, useState } from 'react';
import { useMappedState } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import MapToolbar from '../molecules/MapToolbar';
import MapSummaryCard from './MapSummaryCard';
import MapReviewsList from './MapReviewsList';
import FollowMapButton from '../molecules/FollowMapButton';

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
    paddingLeft: 16,
    paddingRight: 16
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
    minWidth: 'auto'
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
  const smUp = useMediaQuery('(min-width: 600px)');
  const currentMap = useMappedState(
    useCallback(state => state.mapSummary.currentMap, [])
  );

  return (
    <Paper style={styles.bottomNav} square elevation={1}>
      <Toolbar style={smUp ? styles.toolbarLarge : styles.toolbarSmall}>
        <div style={styles.followMapButton}>
          <FollowMapButton currentMap={currentMap} />
        </div>
      </Toolbar>
    </Paper>
  );
});

const MapTabs = React.memo(props => {
  const lgUp = useMediaQuery('(min-width: 1280px)');
  const smUp = useMediaQuery('(min-width: 600px)');

  return (
    <Tabs
      value={props.tabValue}
      onChange={props.handleTabChange}
      style={smUp ? styles.tabsLarge : styles.tabsSmall}
      variant={lgUp ? 'fullWidth' : 'standard'}
      indicatorColor={lgUp ? 'primary' : 'secondary'}
      textColor={lgUp ? 'primary' : 'inherit'}
    >
      <Tab
        icon={lgUp ? <HomeIcon style={styles.tabIcon} /> : null}
        label={lgUp ? null : I18n.t('basic info')}
        style={smUp ? styles.tabLarge : styles.tabSmall}
      />
      <Tab
        icon={lgUp ? <TimelineIcon style={styles.tabIcon} /> : null}
        label={lgUp ? null : I18n.t('timeline')}
        style={smUp ? styles.tabLarge : styles.tabSmall}
      />
    </Tabs>
  );
});

const MapSummary = () => {
  const [tabValue, setTabValue] = useState(0);
  const lgUp = useMediaQuery('(min-width: 1280px)');
  const smUp = useMediaQuery('(min-width: 600px)');

  const handleTabChange = useCallback((e, value) => {
    setTabValue(value);
  });

  return (
    <div style={lgUp ? styles.containerLarge : styles.containerSmall}>
      {lgUp ? null : (
        <AppBar position="absolute">
          <MapToolbar />
          <Toolbar>
            <MapTabs tabValue={tabValue} handleTabChange={handleTabChange} />
          </Toolbar>
        </AppBar>
      )}
      <div style={smUp ? styles.tabContentsLarge : styles.tabContentsSmall}>
        {tabValue === 0 && <MapSummaryCard />}
        {tabValue === 1 && <MapReviewsList />}
      </div>
      {smUp && (
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

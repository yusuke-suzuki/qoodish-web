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
import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  useTheme
} from '@material-ui/core';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      height: '100%',
      [theme.breakpoints.up('lg')]: {
        width: 380
      }
    },
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      width: '100%'
    },
    toolbarContainer: {
      [theme.breakpoints.up('sm')]: {
        position: 'absolute',
        top: 64,
        width: '100%',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }
    },
    tabs: {
      [theme.breakpoints.up('sm')]: {
        height: 64,
        width: '100%'
      }
    },
    tab: {
      height: 56,
      [theme.breakpoints.up('sm')]: {
        height: 64,
        minHeight: 64,
        width: '20%',
        minWidth: 'auto'
      }
    },
    tabContents: {
      marginTop: 112,
      marginBottom: 56,
      overflowY: 'scroll',
      height: 'calc(100% - 168px)',
      [theme.breakpoints.up('sm')]: {
        marginTop: 128,
        marginBottom: 'initial',
        overflowY: 'scroll',
        height: 'calc(100% - 192px)'
      }
    },
    tabIcon: {
      position: 'absolute'
    }
  })
);

const MapBottomNav = React.memo(() => {
  const currentMap = useMappedState(
    useCallback(state => state.mapSummary.currentMap, [])
  );
  const classes = useStyles();

  return (
    <Paper className={classes.bottomNav} square elevation={1}>
      <Toolbar>
        <Box display="flex" justifyContent="flex-end" width="100%">
          <FollowMapButton currentMap={currentMap} />
        </Box>
      </Toolbar>
    </Paper>
  );
});

type TabsProps = {
  tabValue: number;
  handleTabChange: any;
};

const MapTabs = React.memo((props: TabsProps) => {
  const { tabValue, handleTabChange } = props;
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const classes = useStyles();
  const { I18n } = useLocale();

  return (
    <Tabs
      value={tabValue}
      onChange={handleTabChange}
      className={classes.tabs}
      variant={lgUp ? 'fullWidth' : 'standard'}
      indicatorColor={lgUp ? 'primary' : 'secondary'}
      textColor={lgUp ? 'primary' : 'inherit'}
    >
      <Tab
        icon={lgUp ? <HomeIcon className={classes.tabIcon} /> : null}
        label={lgUp ? null : I18n.t('basic info')}
        className={classes.tab}
      />
      <Tab
        icon={lgUp ? <TimelineIcon className={classes.tabIcon} /> : null}
        label={lgUp ? null : I18n.t('timeline')}
        className={classes.tab}
      />
    </Tabs>
  );
});

const MapSummary = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

  const handleTabChange = useCallback((e, value) => {
    setTabValue(value);
  }, []);

  const classes = useStyles();

  return (
    <div className={classes.container}>
      {lgUp ? null : (
        <AppBar position="absolute">
          <MapToolbar />
          <Toolbar>
            <MapTabs tabValue={tabValue} handleTabChange={handleTabChange} />
          </Toolbar>
        </AppBar>
      )}
      <div className={classes.tabContents}>
        {tabValue === 0 && <MapSummaryCard />}
        {tabValue === 1 && <MapReviewsList />}
      </div>
      {smUp && (
        <Paper className={classes.toolbarContainer} square elevation={0}>
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

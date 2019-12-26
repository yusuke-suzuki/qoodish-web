import React, { useCallback, useMemo } from 'react';
import { useMappedState } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Toolbar from '@material-ui/core/Toolbar';

import SearchButton from '../molecules/SearchButton';
import SearchBar from '../molecules/SearchBar';
import AppMenuButton from '../molecules/AppMenuButton';
import NavTabs from './NavTabs';
import Logo from '../molecules/Logo';
import BackButton from '../molecules/BackButton';
import { match } from 'path-to-regexp';

const styles = {
  toolbarLarge: {
    paddingLeft: 12,
    paddingRight: 12
  },
  toolbarSmall: {
    height: 56,
    paddingLeft: 8,
    paddingRight: 8
  },
  logoContainerLarge: {
    marginLeft: 12
  },
  logoContainerSmall: {
    margin: 'auto'
  },
  rightContentsLarge: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
    display: 'inline-flex',
    alignItems: 'center'
  },
  rightContentsSmall: {
    display: 'flex',
    display: 'inline-flex',
    alignItems: 'center'
  },
  search: {
    marginRight: 24
  }
};

const routesShowBackButton = [
  {
    path: '/maps/:mapId'
  },
  {
    path: '/maps/:mapId/reports/:reviewId'
  },
  {
    path: '/spots/:placeId'
  },
  {
    path: '/users/:userId'
  }
];

const ToolbarSmall = React.memo(() => {
  const mapState = useCallback(
    state => ({
      currentLocation: state.shared.currentLocation
    }),
    []
  );
  const { currentLocation } = useMappedState(mapState);

  const showBackButton = useMemo(() => {
    return routesShowBackButton.find(route => {
      return match(route.path)(currentLocation.pathname);
    });
  }, [currentLocation, routesShowBackButton]);

  return (
    <Toolbar style={styles.toolbarSmall}>
      {showBackButton ? <BackButton /> : <AppMenuButton />}
      <div style={styles.logoContainerSmall}>
        <Logo color="inherit" />
      </div>
      <div style={styles.rightContentsSmall}>
        <SearchButton />
      </div>
    </Toolbar>
  );
});

const ToolbarLarge = React.memo(() => {
  return (
    <Toolbar style={styles.toolbarLarge}>
      <AppMenuButton />
      <div style={styles.logoContainerLarge}>
        <Logo color="inherit" />
      </div>
      <div style={styles.rightContentsLarge}>
        <div style={styles.search}>
          <SearchBar />
        </div>
        <NavTabs />
      </div>
    </Toolbar>
  );
});

const NavToolbar = () => {
  const mdUp = useMediaQuery('(min-width: 960px)');

  return mdUp ? <ToolbarLarge /> : <ToolbarSmall />;
};

export default React.memo(NavToolbar);

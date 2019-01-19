import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import loadable from '@loadable/component';

const NavDrawer = loadable(() =>
  import(/* webpackChunkName: "nav_drawer" */ '../molecules/NavDrawer')
);
const MapToolbar = loadable(() =>
  import(/* webpackChunkName: "map_toolbar" */ '../molecules/MapToolbar')
);
const NavToolbar = loadable(() =>
  import(/* webpackChunkName: "nav_toolbar" */ './NavToolbar')
);

import AppBar from '@material-ui/core/AppBar';

const NavBar = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const isMapDetail = useMappedState(
    useCallback(state => state.shared.isMapDetail, [])
  );

  return (
    <div>
      <AppBar position="fixed">
        {isMapDetail && !large ? (
          <MapToolbar showMapName showBackButton />
        ) : (
          <NavToolbar />
        )}
      </AppBar>
      <NavDrawer />
    </div>
  );
};

export default React.memo(NavBar);

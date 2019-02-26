import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

const NavDrawer = React.lazy(() =>
  import(/* webpackChunkName: "nav_drawer" */ '../molecules/NavDrawer')
);
const MapToolbar = React.lazy(() =>
  import(/* webpackChunkName: "map_toolbar" */ '../molecules/MapToolbar')
);
const NavToolbar = React.lazy(() =>
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
        <React.Suspense fallback={null}>
          {isMapDetail && !large ? (
            <MapToolbar showMapName showBackButton />
          ) : (
            <NavToolbar />
          )}
        </React.Suspense>
      </AppBar>
      <React.Suspense fallback={null}>
        <NavDrawer />
      </React.Suspense>
    </div>
  );
};

export default React.memo(NavBar);

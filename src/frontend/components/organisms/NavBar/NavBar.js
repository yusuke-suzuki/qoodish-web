import React from 'react';
import loadable from '@loadable/component';

const NavDrawer = loadable(() =>
  import(/* webpackChunkName: "nav_drawer" */ '../../molecules/NavDrawer')
);
const MapToolbar = loadable(() =>
  import(/* webpackChunkName: "map_toolbar" */ '../../molecules/MapToolbar')
);
const NavToolbar = loadable(() =>
  import(/* webpackChunkName: "nav_toolbar" */ '../NavToolbar')
);

import AppBar from '@material-ui/core/AppBar';

const NavBar = props => {
  return (
    <div>
      <AppBar position="fixed">
        {props.isMapDetail && !props.large ? (
          <MapToolbar
            showMapName
            showBackButton
            handleBackButtonClick={() =>
              props.handleBackButtonClick(props.previousLocation)
            }
          />
        ) : (
          <NavToolbar />
        )}
      </AppBar>
      <NavDrawer />
    </div>
  );
};

export default NavBar;

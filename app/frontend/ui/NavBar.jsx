import React from 'react';
import loadable from '@loadable/component';

const NavDrawerContainer = loadable(() => import(/* webpackChunkName: "nav_drawer" */ '../containers/NavDrawerContainer'));
const MapsTabContainer = loadable(() => import(/* webpackChunkName: "maps_tab" */ '../containers/MapsTabContainer'));
const MapToolbarContainer = loadable(() => import(/* webpackChunkName: "map_toolbar" */ '../containers/MapToolbarContainer'));
const NavToolbarContainer = loadable(() => import(/* webpackChunkName: "nav_toolbar" */ '../containers/NavToolbarContainer'));

import AppBar from '@material-ui/core/AppBar';

const MapToolbar = (props) => {
  return (
    <MapToolbarContainer
      showMapName
      showBackButton
      handleBackButtonClick={() => props.handleBackButtonClick(props.previousLocation)}
    />
  );
};

const NavBar = (props) => {
  return (
    <div>
      <AppBar position="fixed">
        {props.isMapDetail && !props.large ? <MapToolbar {...props} /> : <NavToolbarContainer />}
        {props.mapsTabActive && <MapsTabContainer />}
      </AppBar>
      <NavDrawerContainer />
    </div>
  );
};

export default NavBar;

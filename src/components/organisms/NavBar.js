import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useMappedState } from 'redux-react-hook';

import NavDrawer from '../molecules/NavDrawer';
import MapToolbar from '../molecules/MapToolbar';
import NavToolbar from './NavToolbar';

import AppBar from '@material-ui/core/AppBar';

import { match } from 'path-to-regexp';

const isModalLocation = location => {
  return location && location.state && location.state.modal;
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

const NavBar = () => {
  const [showMapToolbar, setShowMapToolbar] = useState(false);

  const mapState = useCallback(
    state => ({
      currentLocation: state.shared.currentLocation
    }),
    []
  );

  const { currentLocation } = useMappedState(mapState);

  useEffect(() => {
    if (isModalLocation(currentLocation)) {
      return;
    }
    if (match('/maps/:mapId')(currentLocation.pathname)) {
      setShowMapToolbar(true);
    } else {
      setShowMapToolbar(false);
    }
  }, [currentLocation]);

  const showBackButton = useMemo(() => {
    if (isModalLocation(currentLocation)) {
      return false;
    }

    return routesShowBackButton.find(route => {
      return match(route.path)(currentLocation.pathname);
    });
  }, [currentLocation, routesShowBackButton]);

  return (
    <div>
      <AppBar position="fixed">
        {showMapToolbar ? (
          <MapToolbar />
        ) : (
          <NavToolbar showBackButton={showBackButton} />
        )}
      </AppBar>
      <NavDrawer />
    </div>
  );
};

export default React.memo(NavBar);

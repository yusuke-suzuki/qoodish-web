import React, { useMemo, useState, useEffect } from 'react';

import NavDrawer from '../molecules/NavDrawer';
import MapToolbar from '../molecules/MapToolbar';
import NavToolbar from './NavToolbar';

import AppBar from '@material-ui/core/AppBar';

import { match } from 'path-to-regexp';
import DrawerContext from '../../context/DrawerContext';
import { useRouter } from 'next/router';

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
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [showMapToolbar, setShowMapToolbar] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (match('/maps/:mapId')(router.pathname)) {
      setShowMapToolbar(true);
    } else {
      setShowMapToolbar(false);
    }
  }, [router.pathname]);

  const showBackButton = useMemo(() => {
    return routesShowBackButton.find(route => {
      return match(route.path)(router.pathname);
    });
  }, [router.pathname, routesShowBackButton]);

  return (
    <DrawerContext.Provider
      value={{
        drawerOpen: drawerOpen,
        setDrawerOpen: setDrawerOpen
      }}
    >
      <AppBar position="fixed">
        {showMapToolbar ? (
          <MapToolbar />
        ) : (
          <NavToolbar showBackButton={showBackButton ? true : false} />
        )}
      </AppBar>
      <NavDrawer />
    </DrawerContext.Provider>
  );
};

export default React.memo(NavBar);

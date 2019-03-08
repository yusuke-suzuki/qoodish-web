import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';

import NavDrawer from '../molecules/NavDrawer';
import MapToolbar from '../molecules/MapToolbar';
import NavToolbar from './NavToolbar';

import AppBar from '@material-ui/core/AppBar';

const NavBar = () => {
  const isMapDetail = useMappedState(
    useCallback(state => state.shared.isMapDetail, [])
  );

  return (
    <div>
      <AppBar position="fixed">
        {isMapDetail ? (
          <MapToolbar showBackButton showMapName />
        ) : (
          <NavToolbar />
        )}
      </AppBar>
      <NavDrawer />
    </div>
  );
};

export default React.memo(NavBar);

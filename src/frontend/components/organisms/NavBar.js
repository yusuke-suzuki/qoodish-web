import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState } from 'redux-react-hook';

import NavDrawer from '../molecules/NavDrawer';
import MapToolbar from '../molecules/MapToolbar';
import NavToolbar from './NavToolbar';

import AppBar from '@material-ui/core/AppBar';

import { match } from 'path-to-regexp';

const NavBar = () => {
  const [isMapDetail, setIsMapDetail] = useState(false);

  const mapState = useCallback(
    state => ({
      currentLocation: state.shared.currentLocation
    }),
    []
  );

  const { currentLocation } = useMappedState(mapState);

  useEffect(() => {
    if (currentLocation.state && currentLocation.state.modal) {
      return;
    }

    if (match('/maps/:mapId')(currentLocation.pathname)) {
      setIsMapDetail(true);
    } else {
      setIsMapDetail(false);
    }
  }, [currentLocation]);

  return (
    <div>
      <AppBar position="fixed">
        {isMapDetail ? <MapToolbar /> : <NavToolbar />}
      </AppBar>
      <NavDrawer />
    </div>
  );
};

export default React.memo(NavBar);

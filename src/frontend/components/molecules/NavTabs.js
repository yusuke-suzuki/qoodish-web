import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState } from 'redux-react-hook';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import Link from './Link';
import I18n from '../../utils/I18n';

const styles = {
  tabs: {},
  tab: {
    height: 64,
    minHeight: 64,
    minWidth: 90
  }
};

const NavTabs = () => {
  const mapState = useCallback(
    state => ({
      currentLocation: state.shared.currentLocation
    }),
    []
  );
  const { currentLocation } = useMappedState(mapState);

  const [selectedValue, setSelectedValue] = useState(false);

  const isSelected = pathname => {
    return currentLocation && currentLocation.pathname === pathname;
  };

  useEffect(
    () => {
      if (!currentLocation) {
        return;
      }
      switch (currentLocation.pathname) {
        case '/':
          setSelectedValue(0);
          break;
        case '/discover':
          setSelectedValue(1);
          break;
        case '/profile':
          setSelectedValue(2);
          break;
        default:
          setSelectedValue(false);
      }
    },
    [currentLocation]
  );

  return (
    <Tabs
      value={selectedValue}
      indicatorColor="secondary"
      textColor="inherit"
      style={styles.tabs}
    >
      <Tab
        icon={<HomeIcon />}
        selected={true}
        style={styles.tab}
        component={Link}
        to="/"
        title={I18n.t('home')}
      />
      <Tab
        icon={<ExploreIcon />}
        selected={isSelected('/discover')}
        style={styles.tab}
        component={Link}
        to="/discover"
        title={I18n.t('discover')}
      />
      <Tab
        icon={<AccountCircleIcon />}
        selected={isSelected('/profile')}
        style={styles.tab}
        component={Link}
        to="/profile"
        title={I18n.t('account')}
      />
    </Tabs>
  );
};

export default React.memo(NavTabs);

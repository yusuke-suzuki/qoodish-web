import React from 'react';
import I18n from '../containers/I18n';
import Toolbar from '@material-ui/core/Toolbar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const styles = {
  tabs: {
    width: '100%'
  },
  tabLarge: {
    height: 64
  },
  tabSmall: {
    height: 56
  }
};

const MapsTab = (props) => {
  return (
    <Toolbar disableGutters>
      <Tabs
        value={props.mapsTabValue}
        fullWidth={!props.large}
        centered
        style={styles.tabs}
      >
        <Tab
          label={I18n.t('following')}
          style={props.large ? styles.tabLarge : styles.tabSmall}
          onClick={props.handleFollowingMapsTabClick}
        />
        <Tab
          label={I18n.t('my maps')}
          style={props.large ? styles.tabLarge : styles.tabSmall}
          onClick={props.handleMyMapsTabClick}
        />
      </Tabs>
    </Toolbar>
  );
};

export default MapsTab;

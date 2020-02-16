import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Toolbar from '@material-ui/core/Toolbar';

import SearchButton from '../molecules/SearchButton';
import SearchBar from '../molecules/SearchBar';
import AppMenuButton from '../molecules/AppMenuButton';
import NavTabs from './NavTabs';
import Logo from '../molecules/Logo';
import BackButton from '../molecules/BackButton';

const styles = {
  toolbarLarge: {
    paddingLeft: 12,
    paddingRight: 12
  },
  toolbarSmall: {
    height: 56,
    paddingLeft: 8,
    paddingRight: 8
  },
  logoContainerLarge: {
    marginLeft: 12
  },
  logoContainerSmall: {
    margin: 'auto'
  },
  rightContentsLarge: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
    display: 'inline-flex',
    alignItems: 'center'
  },
  rightContentsSmall: {
    display: 'flex',
    display: 'inline-flex',
    alignItems: 'center'
  },
  search: {
    marginRight: 24
  }
};

const ToolbarSmall = React.memo(props => {
  const { showBackButton } = props;

  return (
    <Toolbar style={styles.toolbarSmall}>
      {showBackButton ? <BackButton /> : <AppMenuButton />}
      <div style={styles.logoContainerSmall}>
        <Logo color="inherit" />
      </div>
      <div style={styles.rightContentsSmall}>
        <SearchButton />
      </div>
    </Toolbar>
  );
});

const ToolbarLarge = React.memo(() => {
  return (
    <Toolbar style={styles.toolbarLarge}>
      <AppMenuButton />
      <div style={styles.logoContainerLarge}>
        <Logo color="inherit" />
      </div>
      <div style={styles.rightContentsLarge}>
        <div style={styles.search}>
          <SearchBar />
        </div>
        <NavTabs />
      </div>
    </Toolbar>
  );
});

const NavToolbar = props => {
  const { showBackButton } = props;
  const mdUp = useMediaQuery('(min-width: 960px)');

  return mdUp ? (
    <ToolbarLarge />
  ) : (
    <ToolbarSmall showBackButton={showBackButton} />
  );
};

export default React.memo(NavToolbar);

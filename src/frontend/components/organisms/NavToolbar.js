import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import SearchButton from '../molecules/SearchButton';
import SearchBar from '../molecules/SearchBar';
import AppMenuButton from '../molecules/AppMenuButton';
import NavTabs from './NavTabs';
import Logo from '../molecules/Logo';

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

const ToolbarSmall = React.memo(() => {
  const mapState = useCallback(
    state => ({
      showBackButton: state.shared.showBackButton,
      previousLocation: state.shared.previousLocation,
      history: state.shared.history
    }),
    []
  );
  const { showBackButton, previousLocation, history } = useMappedState(
    mapState
  );

  const handleBackButtonClick = useCallback(() => {
    if (previousLocation) {
      history.goBack();
    } else {
      history.push('/');
    }
  });

  return (
    <Toolbar style={styles.toolbarSmall}>
      {showBackButton ? (
        <IconButton color="inherit" onClick={handleBackButtonClick}>
          <ArrowBackIcon />
        </IconButton>
      ) : (
        <AppMenuButton />
      )}
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

const NavToolbar = () => {
  const mdUp = useMediaQuery('(min-width: 960px)');

  return mdUp ? <ToolbarLarge /> : <ToolbarSmall />;
};

export default React.memo(NavToolbar);

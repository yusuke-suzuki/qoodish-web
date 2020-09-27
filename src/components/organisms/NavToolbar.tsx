import React, { memo } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Toolbar from '@material-ui/core/Toolbar';

import SearchButton from '../molecules/SearchButton';
import SearchBar from '../molecules/SearchBar';
import AppMenuButton from '../molecules/AppMenuButton';
import NavTabs from './NavTabs';
import Logo from '../molecules/Logo';
import BackButton from '../molecules/BackButton';
import { useTheme } from '@material-ui/core';

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
    width: '100%',
    justifyContent: 'flex-end',
    display: 'inline-flex',
    alignItems: 'center'
  },
  rightContentsSmall: {
    display: 'inline-flex',
    alignItems: 'center'
  },
  search: {
    marginRight: 24
  }
};

type Props = {
  showBackButton: boolean;
};

export default memo(function NavToolbar(props: Props) {
  const { showBackButton } = props;
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return mdUp ? (
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
  ) : (
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

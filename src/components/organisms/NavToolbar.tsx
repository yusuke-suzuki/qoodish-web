import React, { memo } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Toolbar from '@material-ui/core/Toolbar';

import SearchButton from '../molecules/SearchButton';
import SearchBar from '../molecules/SearchBar';
import AppMenuButton from '../molecules/AppMenuButton';
import NavTabs from './NavTabs';
import Logo from '../molecules/Logo';
import BackButton from '../molecules/BackButton';
import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  useTheme
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuButton: {
      marginRight: theme.spacing(1)
    },
    search: {
      marginRight: theme.spacing(3)
    }
  })
);

type Props = {
  showBackButton: boolean;
};

export default memo(function NavToolbar(props: Props) {
  const { showBackButton } = props;
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const classes = useStyles();

  return mdUp ? (
    <Toolbar>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Box display="flex" alignItems="center">
          <Box className={classes.menuButton}>
            <AppMenuButton />
          </Box>
          <Logo color="inherit" />
        </Box>
        <Box display="flex" alignItems="center">
          <Box className={classes.search}>
            <SearchBar />
          </Box>
          <NavTabs />
        </Box>
      </Box>
    </Toolbar>
  ) : (
    <Toolbar>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Box className={classes.menuButton}>
          {showBackButton ? <BackButton /> : <AppMenuButton />}
        </Box>
        <Logo color="inherit" />
        <SearchButton />
      </Box>
    </Toolbar>
  );
});

import React, { memo } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Toolbar from '@material-ui/core/Toolbar';

import SearchButton from '../molecules/SearchButton';
import SearchBar from '../molecules/SearchBar';
import AppMenuButton from '../molecules/AppMenuButton';
import NavTabs from './NavTabs';
import Logo from '../molecules/Logo';
import BackButton from '../molecules/BackButton';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      height: 56,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      [theme.breakpoints.up('md')]: {
        height: 'auto',
        paddingLeft: 12,
        paddingRight: 12
      }
    },
    logoContainer: {
      margin: 'auto',
      [theme.breakpoints.up('md')]: {
        margin: 'initial',
        marginLeft: 12
      }
    },
    rightContents: {
      display: 'inline-flex',
      alignItems: 'center',
      [theme.breakpoints.up('md')]: {
        width: '100%',
        justifyContent: 'flex-end'
      }
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
    <Toolbar className={classes.toolbar}>
      <AppMenuButton />
      <div className={classes.logoContainer}>
        <Logo color="inherit" />
      </div>
      <div className={classes.rightContents}>
        <div className={classes.search}>
          <SearchBar />
        </div>
        <NavTabs />
      </div>
    </Toolbar>
  ) : (
    <Toolbar className={classes.toolbar}>
      {showBackButton ? <BackButton /> : <AppMenuButton />}
      <div className={classes.logoContainer}>
        <Logo color="inherit" />
      </div>
      <div className={classes.rightContents}>
        <SearchButton />
      </div>
    </Toolbar>
  );
});

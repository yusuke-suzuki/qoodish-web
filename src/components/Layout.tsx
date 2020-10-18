import React, { useCallback, useEffect, useState } from 'react';
import {
  CssBaseline,
  makeStyles,
  Grid,
  useMediaQuery,
  useTheme,
  Box,
  LinearProgress
} from '@material-ui/core';
import NavBar from './organisms/NavBar';
import RightItems from './organisms/RightItems';
import BottomNav from './molecules/BottomNav';
import SharedDialogs from './SharedDialogs';
import { useRouter } from 'next/router';

const useStyles = makeStyles(theme => ({
  toolbar: theme.mixins.toolbar,
  container: {
    margin: 'auto',
    paddingBottom: theme.spacing(7),
    [theme.breakpoints.up('md')]: {
      maxWidth: 1176,
      paddingBottom: 0
    }
  },
  main: {
    padding: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      padding: 20
    }
  },
  right: {
    padding: 20
  },
  progress: {
    position: 'fixed',
    top: 0,
    zIndex: 1101,
    width: '100%'
  }
}));

type Props = {
  children: any;
  fullWidth: boolean;
  hideBottomNav: boolean;
};

function Layout(props: Props) {
  const { children, fullWidth, hideBottomNav } = props;

  const classes = useStyles();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);

  const showProgress = useCallback(() => {
    setLoading(true);
  }, []);

  const hideProgress = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    router.events.on('routeChangeStart', showProgress);
    router.events.on('routeChangeComplete', hideProgress);
    router.events.on('routeChangeError', hideProgress);

    return () => {
      router.events.off('routeChangeStart', showProgress);
      router.events.off('routeChangeComplete', hideProgress);
      router.events.off('routeChangeError', hideProgress);
    };
  }, []);

  return (
    <>
      <Box display={loading ? 'block' : 'none'} className={classes.progress}>
        <LinearProgress color="secondary" />
      </Box>
      <NavBar />
      <div className={classes.toolbar} />
      <CssBaseline />
      <Grid container className={fullWidth ? '' : classes.container}>
        <Grid
          item
          xs={12}
          sm={12}
          md={fullWidth ? 12 : 8}
          lg={fullWidth ? 12 : 8}
          xl={fullWidth ? 12 : 8}
          className={fullWidth ? '' : classes.main}
        >
          {children}
        </Grid>
        {mdUp && !fullWidth && (
          <Grid item md={4} lg={4} xl={4} className={classes.right}>
            <RightItems />
          </Grid>
        )}
      </Grid>
      {!smUp && !hideBottomNav && <BottomNav />}
      <SharedDialogs />
    </>
  );
}

export default React.memo(Layout);

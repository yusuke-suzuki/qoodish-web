import React, { useCallback, useEffect } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import amber from '@material-ui/core/colors/amber';
import lightBlue from '@material-ui/core/colors/lightBlue';
import Grid from '@material-ui/core/Grid';

const Routes = React.lazy(() =>
  import(/* webpackChunkName: "routes" */ './Routes')
);
const RightItems = React.lazy(() =>
  import(/* webpackChunkName: "right_items" */ './organisms/RightItems')
);
const NavBar = React.lazy(() =>
  import(/* webpackChunkName: "nav_bar" */ './organisms/NavBar')
);
const BottomNav = React.lazy(() =>
  import(/* webpackChunkName: "bottom_nav" */ './molecules/BottomNav')
);
const SharedDialogs = React.lazy(() =>
  import(/* webpackChunkName: "shared_dialogs" */ './SharedDialogs')
);

const theme = createMuiTheme({
  palette: {
    primary: {
      light: amber[300],
      main: amber[500],
      dark: amber[700],
      contrastText: '#fff'
    },
    secondary: {
      light: lightBlue[300],
      main: lightBlue[500],
      dark: lightBlue[700],
      contrastText: '#fff'
    }
  },
  typography: {
    useNextVariants: true
  }
});

const styles = {
  containerLarge: {
    maxWidth: 1176,
    margin: 'auto',
    paddingTop: 64
  },
  containerSmall: {
    margin: 'auto',
    paddingTop: 56,
    paddingBottom: 56
  },
  mainLarge: {
    padding: 20
  },
  mainSmall: {
    padding: 16
  },
  right: {
    padding: 20
  }
};

const scrollTop = () => {
  window.scrollTo(0, 0);
};

const Layout = () => {
  const smUp = useMediaQuery('(min-width: 600px)');
  const mdUp = useMediaQuery('(min-width: 960px)');
  const lgUp = useMediaQuery('(min-width: 1280px)');
  const xlUp = useMediaQuery('(min-width: 1920px)');

  const mapState = useCallback(
    state => ({
      showBottomNav: state.shared.showBottomNav,
      currentLocation: state.shared.currentLocation,
      fullWidth: state.shared.fullWidth
    }),
    []
  );
  const { showBottomNav, currentLocation, fullWidth } = useMappedState(
    mapState
  );

  useEffect(
    () => {
      if (
        !currentLocation ||
        (currentLocation.state && currentLocation.state.modal)
      ) {
        return;
      }
      scrollTop();
    },
    [currentLocation]
  );

  return (
    <MuiThemeProvider theme={theme}>
      <React.Suspense fallback={null}>
        <NavBar />
      </React.Suspense>
      <Grid
        container
        style={
          fullWidth ? {} : smUp ? styles.containerLarge : styles.containerSmall
        }
      >
        <Grid
          item
          xs={12}
          sm={12}
          md={fullWidth ? 12 : 8}
          lg={fullWidth ? 12 : 8}
          xl={fullWidth ? 12 : 8}
          style={fullWidth ? {} : smUp ? styles.mainLarge : styles.mainSmall}
        >
          <React.Suspense fallback={null}>
            <Routes />
          </React.Suspense>
        </Grid>
        {mdUp && !fullWidth && (
          <Grid item md={4} lg={4} xl={4} style={styles.right}>
            <React.Suspense fallback={null}>
              <RightItems />
            </React.Suspense>
          </Grid>
        )}
      </Grid>
      {!smUp && showBottomNav && (
        <React.Suspense fallback={null}>
          <BottomNav />
        </React.Suspense>
      )}
      <React.Suspense fallback={null}>
        <SharedDialogs />
      </React.Suspense>
    </MuiThemeProvider>
  );
};

export default React.memo(Layout);

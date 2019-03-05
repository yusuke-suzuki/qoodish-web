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
const NavBar = React.lazy(() =>
  import(/* webpackChunkName: "nav_bar" */ './organisms/NavBar')
);
const BottomNav = React.lazy(() =>
  import(/* webpackChunkName: "bottom_nav" */ './molecules/BottomNav')
);
const SharedDialogs = React.lazy(() =>
  import(/* webpackChunkName: "shared_dialogs" */ './SharedDialogs')
);
const RecommendMaps = React.lazy(() =>
  import(/* webpackChunkName: "recommend_maps" */ './organisms/RecommendMaps')
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
  rightGrid: {
    marginTop: 78,
    paddingRight: 16
  }
};

const scrollTop = () => {
  window.scrollTo(0, 0);
};

const Layout = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      showSideNav: state.shared.showSideNav,
      showBottomNav: state.shared.showBottomNav
    }),
    []
  );
  const { showSideNav, showBottomNav } = useMappedState(mapState);

  useEffect(() => {
    scrollTop();
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <Grid container>
        <Grid item xs={12} sm={12} md={3} lg={2} xl={2}>
          <React.Suspense fallback={null}>
            <NavBar />
          </React.Suspense>
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={!large || !showSideNav ? 12 : 6}
          lg={!large || !showSideNav ? 12 : 8}
          xl={!large || !showSideNav ? 12 : 8}
        >
          <React.Suspense fallback={null}>
            <Routes />
          </React.Suspense>
        </Grid>
        {large && showSideNav && (
          <Grid item md={3} lg={2} xl={2} style={styles.rightGrid}>
            <React.Suspense fallback={null}>
              <RecommendMaps />
            </React.Suspense>
          </Grid>
        )}
      </Grid>
      {!large && showBottomNav && (
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

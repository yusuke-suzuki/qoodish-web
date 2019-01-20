import React, { useCallback, useEffect } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import loadable from '@loadable/component';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import amber from '@material-ui/core/colors/amber';
import lightBlue from '@material-ui/core/colors/lightBlue';
import Grid from '@material-ui/core/Grid';

const Routes = loadable(() =>
  import(/* webpackChunkName: "routes" */ './Routes')
);
const NavBar = loadable(() =>
  import(/* webpackChunkName: "nav_bar" */ './organisms/NavBar')
);
const BottomNav = loadable(() =>
  import(/* webpackChunkName: "bottom_nav" */ './molecules/BottomNav')
);
const SharedDialogs = loadable(() =>
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
          <NavBar />
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={!large || !showSideNav ? 12 : 6}
          lg={!large || !showSideNav ? 12 : 8}
          xl={!large || !showSideNav ? 12 : 8}
        >
          <Routes />
        </Grid>
      </Grid>
      {!large && showBottomNav && <BottomNav />}
      <SharedDialogs />
    </MuiThemeProvider>
  );
};

export default Layout;

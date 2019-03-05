import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Link from '../molecules/Link';

const SearchBar = React.lazy(() =>
  import(/* webpackChunkName: "search_bar" */ '../molecules/SearchBar')
);
const AppMenuButton = React.lazy(() =>
  import(/* webpackChunkName: "app_menu" */ '../molecules/AppMenuButton')
);
const AvatarMenu = React.lazy(() =>
  import(/* webpackChunkName: "avatar_menu" */ '../molecules/AvatarMenu')
);
const NotificationMenu = React.lazy(() =>
  import(/* webpackChunkName: "notification_menu" */ './NotificationMenu')
);

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';

import I18n from '../../utils/I18n';
import openSearchMapsDialog from '../../actions/openSearchMapsDialog';

const styles = {
  toolbarLarge: {
    paddingLeft: 10,
    paddingRight: 10
  },
  toolbarSmall: {
    height: 56
  },
  logo: {
    cursor: 'pointer',
    paddingLeft: 8
  },
  pageTitleLarge: {
    cursor: 'pointer',
    borderLeft: '1px solid rgba(255,255,255,0.2)',
    paddingLeft: 24,
    marginLeft: 24
  },
  pageTitleSmall: {
    cursor: 'pointer',
    paddingLeft: 64
  },
  rightContentsLarge: {
    position: 'absolute',
    right: 10,
    display: 'flex'
  },
  rightContentsSmall: {
    position: 'absolute',
    right: 0,
    display: 'flex'
  },
  loginButtonLarge: {
    marginRight: 12
  },
  loginButtonSmall: {
    marginRight: 8
  },
  leftButton: {
    marginLeft: 8,
    position: 'absolute'
  },
  link: {
    textDecoration: 'none',
    color: 'inherit'
  },
  search: {
    marginLeft: 'auto',
    marginRight: 150
  },
  rightContents: {
    display: 'inline-flex',
    alignItems: 'center'
  }
};

const handleTitleClick = () => {
  window.scrollTo(0, 0);
};

const SearchButton = () => {
  const dispatch = useDispatch();
  const handleSearchButtonClick = useCallback(() => {
    dispatch(openSearchMapsDialog());
  });

  return (
    <IconButton color="inherit" onClick={handleSearchButtonClick}>
      <SearchIcon />
    </IconButton>
  );
};

const NavToolbar = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      pageTitle: state.shared.pageTitle,
      showBackButton: state.shared.showBackButton,
      previousLocation: state.shared.previousLocation,
      history: state.shared.history
    }),
    []
  );
  const {
    currentUser,
    pageTitle,
    showBackButton,
    previousLocation,
    history
  } = useMappedState(mapState);

  const handleBackButtonClick = useCallback(() => {
    if (previousLocation) {
      history.goBack();
    } else {
      history.push('/');
    }
  });

  return (
    <Toolbar
      disableGutters
      style={large ? styles.toolbarLarge : styles.toolbarSmall}
    >
      {!large && showBackButton ? (
        <IconButton
          color="inherit"
          onClick={handleBackButtonClick}
          style={large ? {} : styles.leftButton}
        >
          <ArrowBackIcon />
        </IconButton>
      ) : (
        <AppMenuButton />
      )}
      {large ? (
        <Typography variant="h5" color="inherit" style={styles.logo}>
          <Link to="/" style={styles.link} title="Qoodish">
            Qoodish
          </Link>
        </Typography>
      ) : null}
      <Typography
        variant={large ? 'h5' : 'h6'}
        color="inherit"
        noWrap
        style={large ? styles.pageTitleLarge : styles.pageTitleSmall}
        onClick={handleTitleClick}
      >
        {pageTitle}
      </Typography>
      {large && (
        <div style={styles.search}>
          <React.Suspense fallback={null}>
            <SearchBar />
          </React.Suspense>
        </div>
      )}
      <div
        style={large ? styles.rightContentsLarge : styles.rightContentsSmall}
      >
        {currentUser && currentUser.isAnonymous ? (
          <div
            style={large ? styles.loginButtonLarge : styles.loginButtonSmall}
          >
            {!large && (
              <React.Suspense fallback={null}>
                <SearchButton />
              </React.Suspense>
            )}
            <Button
              color="inherit"
              component={Link}
              to="/login"
              title={I18n.t('login')}
            >
              {I18n.t('login')}
            </Button>
          </div>
        ) : (
          <div style={styles.rightContents}>
            {!large && (
              <React.Suspense fallback={null}>
                <SearchButton {...props} />
              </React.Suspense>
            )}
            {large && (
              <React.Suspense fallback={null}>
                <NotificationMenu />
              </React.Suspense>
            )}
            <AvatarMenu />
          </div>
        )}
      </div>
    </Toolbar>
  );
};

export default React.memo(NavToolbar);

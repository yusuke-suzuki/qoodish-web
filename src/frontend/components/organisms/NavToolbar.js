import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Link from '../molecules/Link';

import SearchBar from '../molecules/SearchBar';
import AppMenuButton from '../molecules/AppMenuButton';
import AvatarMenu from '../molecules/AvatarMenu';
import NotificationMenu from './NotificationMenu';
import NavTabs from '../molecules/NavTabs';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';

import openSearchMapsDialog from '../../actions/openSearchMapsDialog';

const styles = {
  toolbarSmall: {
    height: 56
  },
  logo: {
    cursor: 'pointer',
    marginLeft: 8
  },
  pageTitleSmall: {
    cursor: 'pointer',
    marginLeft: 8
  },
  rightContentsLarge: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end'
  },
  rightContentsSmall: {
    display: 'flex',
    marginLeft: 'auto'
  },
  leftButton: {
    position: 'absolute'
  },
  link: {
    textDecoration: 'none',
    color: 'inherit'
  },
  search: {
    alignSelf: 'center'
  },
  rightContents: {
    display: 'inline-flex',
    alignItems: 'center'
  }
};

const handleTitleClick = () => {
  window.scrollTo(0, 0);
};

const SearchButton = React.memo(() => {
  const dispatch = useDispatch();
  const handleSearchButtonClick = useCallback(() => {
    dispatch(openSearchMapsDialog());
  });

  return (
    <IconButton color="inherit" onClick={handleSearchButtonClick}>
      <SearchIcon />
    </IconButton>
  );
});

const ToolbarSmall = React.memo(() => {
  const mapState = useCallback(
    state => ({
      pageTitle: state.shared.pageTitle,
      showBackButton: state.shared.showBackButton,
      previousLocation: state.shared.previousLocation,
      history: state.shared.history
    }),
    []
  );
  const {
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
    <Toolbar style={styles.toolbarSmall}>
      {showBackButton ? (
        <IconButton
          color="inherit"
          onClick={handleBackButtonClick}
          style={styles.leftButton}
        >
          <ArrowBackIcon />
        </IconButton>
      ) : (
        <AppMenuButton />
      )}
      <Typography
        variant={'h6'}
        color="inherit"
        noWrap
        style={styles.pageTitleSmall}
        onClick={handleTitleClick}
      >
        {pageTitle}
      </Typography>
      <div style={styles.rightContentsSmall}>
        <div style={styles.rightContents}>
          <SearchButton />
          <AvatarMenu />
        </div>
      </div>
    </Toolbar>
  );
});

const ToolbarLarge = React.memo(() => {
  return (
    <Toolbar>
      <AppMenuButton />
      <Typography variant="h5" color="inherit" style={styles.logo}>
        <Link to="/" style={styles.link} title="Qoodish">
          Qoodish
        </Link>
      </Typography>
      <div style={styles.rightContentsLarge}>
        <NavTabs />

        <div style={styles.search}>
          <SearchBar />
        </div>
        <div style={styles.rightContents}>
          <NotificationMenu />
          <AvatarMenu />
        </div>
      </div>
    </Toolbar>
  );
});

const NavToolbar = () => {
  const large = useMediaQuery('(min-width: 600px)');

  return large ? <ToolbarLarge /> : <ToolbarSmall />;
};

export default React.memo(NavToolbar);

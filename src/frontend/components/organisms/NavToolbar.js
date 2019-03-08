import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import SearchButton from '../molecules/SearchButton';
import SearchBar from '../molecules/SearchBar';
import AppMenuButton from '../molecules/AppMenuButton';
import NavTabs from './NavTabs';
import Link from '../molecules/Link';

const styles = {
  logo: {
    cursor: 'pointer',
    marginLeft: 12
  },
  pageTitleSmall: {
    cursor: 'pointer',
    marginLeft: 8
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
    marginLeft: 'auto',
    display: 'inline-flex',
    alignItems: 'center'
  },
  link: {
    textDecoration: 'none',
    color: 'inherit'
  },
  search: {
    marginRight: 24
  }
};

const handleTitleClick = () => {
  window.scrollTo(0, 0);
};

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
    <Toolbar>
      {showBackButton ? (
        <IconButton color="inherit" onClick={handleBackButtonClick}>
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
        <SearchButton />
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

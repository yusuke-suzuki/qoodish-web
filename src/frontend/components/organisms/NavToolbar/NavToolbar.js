import React from 'react';
import { Link } from 'react-router-dom';
import loadable from '@loadable/component';

const SearchBar = loadable(() =>
  import(/* webpackChunkName: "search_bar" */ '../../molecules/SearchBar')
);
const AppMenuButton = loadable(() =>
  import(/* webpackChunkName: "app_menu" */ '../../molecules/AppMenuButton')
);
const AvatarMenu = loadable(() =>
  import(/* webpackChunkName: "avatar_menu" */ '../../molecules/AvatarMenu')
);
const NotificationMenu = loadable(() =>
  import(/* webpackChunkName: "notification_menu" */ '../NotificationMenu')
);

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';

import I18n from '../../../utils/I18n';

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

const BackButton = props => {
  return (
    <IconButton
      color="inherit"
      onClick={() => props.handleBackButtonClick(props.previousLocation)}
      style={props.large ? {} : styles.leftButton}
    >
      <ArrowBackIcon />
    </IconButton>
  );
};

const Logo = () => {
  return (
    <Typography variant="h5" color="inherit" style={styles.logo}>
      <Link to="/" style={styles.link} title="Qoodish">
        Qoodish
      </Link>
    </Typography>
  );
};

const RightContentsForAnonymous = props => {
  return (
    <div>
      {!props.large && <SearchButton {...props} />}
      <Button
        color="inherit"
        component={Link}
        to="/login"
        title={I18n.t('login')}
      >
        {I18n.t('login')}
      </Button>
    </div>
  );
};

const SearchButton = props => {
  return (
    <IconButton color="inherit" onClick={props.handleSearchButtonClick}>
      <SearchIcon />
    </IconButton>
  );
};

const RightContents = props => {
  return (
    <div style={styles.rightContents}>
      {!props.large && <SearchButton {...props} />}
      {props.large && <NotificationMenu />}
      <AvatarMenu />
    </div>
  );
};

const NavToolbar = props => {
  return (
    <Toolbar
      disableGutters
      style={props.large ? styles.toolbarLarge : styles.toolbarSmall}
    >
      {!props.large && props.showBackButton ? (
        <BackButton {...props} />
      ) : (
        <AppMenuButton />
      )}
      {props.large ? <Logo /> : null}
      <Typography
        variant={props.large ? 'h5' : 'h6'}
        color="inherit"
        noWrap
        style={props.large ? styles.pageTitleLarge : styles.pageTitleSmall}
        onClick={handleTitleClick}
      >
        {props.pageTitle}
      </Typography>
      {props.large && (
        <div style={styles.search}>
          <SearchBar />
        </div>
      )}
      <div
        style={
          props.large ? styles.rightContentsLarge : styles.rightContentsSmall
        }
      >
        {props.currentUser && props.currentUser.isAnonymous ? (
          <RightContentsForAnonymous {...props} />
        ) : (
          <RightContents {...props} />
        )}
      </div>
    </Toolbar>
  );
};

export default NavToolbar;

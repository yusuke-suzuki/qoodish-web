import React from 'react';
import { Link } from 'react-router-dom';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Paper from '@material-ui/core/Paper';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import MapIcon from '@material-ui/icons/Map';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import I18n from '../containers/I18n';

const styles = {
  bottomNav: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    zIndex: 1
  },
  bottomAction: {
    width: '20%',
    minWidth: 'auto',
    paddingTop: 8
  },
  link: {
    textDecoration: 'none',
    color: 'inherit'
  }
};

export default class BottomNav extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0
    };
  }

  componentWillMount() {
    this.switchBottomNav(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.switchBottomNav(nextProps);
  }

  switchBottomNav(props) {
    let tabValue = undefined;
    switch (props.pathname) {
      case '/':
        tabValue = 0;
        break;
      case '/discover':
        tabValue = 1;
        break;
      case '/maps':
        tabValue = 2;
        break;
      case '/profile':
        tabValue = 3;
        break;
      case '/notifications':
        tabValue = 4;
        break;
    }
    this.setState({ tabValue: tabValue });
  }

  render() {
    return (
      <Paper style={styles.bottomNav} elevation={20}>
        <BottomNavigation value={this.state.tabValue}>
          <BottomNavigationAction
            component={Link}
            to="/"
            title={I18n.t('home')}
            icon={<HomeIcon />}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            component={Link}
            to="/discover"
            title={I18n.t('discover')}
            icon={<ExploreIcon />}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            component={Link}
            to="/maps"
            title={I18n.t('maps')}
            icon={<MapIcon />}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            component={Link}
            to="/profile"
            title={I18n.t('account')}
            icon={<AccountCircleIcon />}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            component={Link}
            to="/notifications"
            title={I18n.t('notice')}
            icon={this.renderNotificationIcon()}
            style={styles.bottomAction}
          />
        </BottomNavigation>
      </Paper>
    );
  }

  renderNotificationIcon() {
    if (this.props.unreadNotifications.length > 0) {
      return (
        <Badge
          badgeContent={this.props.unreadNotifications.length}
          color="secondary"
        >
          <NotificationsIcon />
        </Badge>
      );
    } else {
      return <NotificationsIcon />;
    }
  }
}

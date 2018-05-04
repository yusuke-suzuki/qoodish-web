import React from 'react';
import { Link } from 'react-router-dom';
import BottomNavigation, {
  BottomNavigationAction
} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import HomeIcon from 'material-ui-icons/Home';
import ExploreIcon from 'material-ui-icons/Explore';
import MapIcon from 'material-ui-icons/Map';
import NotificationsIcon from 'material-ui-icons/Notifications';
import Badge from 'material-ui/Badge';
import AccountCircleIcon from 'material-ui-icons/AccountCircle';

const styles = {
  bottomNav: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    zIndex: 1
  },
  bottomAction: {
    minWidth: 'auto'
  },
  link: {
    textDecoration: 'none',
    color: 'inherit'
  }
};

export default class BottomNav extends React.Component {
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
        <BottomNavigation showLabels value={this.state.tabValue}>
          <BottomNavigationAction
            label={<Link to="/" style={styles.link}>Home</Link>}
            icon={<Link to="/" style={styles.link}><HomeIcon /></Link>}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            label={<Link to="/discover" style={styles.link}>Discover</Link>}
            icon={<Link to="/discover" style={styles.link}><ExploreIcon /></Link>}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            label={<Link to="/maps" style={styles.link}>Maps</Link>}
            icon={<Link to="/maps" style={styles.link}><MapIcon /></Link>}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            label={<Link to="/profile" style={styles.link}>Profile</Link>}
            icon={<Link to="/profile" style={styles.link}><AccountCircleIcon /></Link>}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            label={<Link to="/notifications" style={styles.link}>Notice</Link>}
            icon={
              <Link to="/notifications" style={styles.link}>
                {this.renderNotificationIcon()}
              </Link>
            }
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

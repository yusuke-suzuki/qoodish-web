import React from 'react';
import BottomNavigation, {
  BottomNavigationAction
} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import HomeIcon from 'material-ui-icons/Home';
import ExploreIcon from 'material-ui-icons/Explore';
import MapIcon from 'material-ui-icons/Map';
import NotificationsIcon from 'material-ui-icons/Notifications';
import Badge from 'material-ui/Badge';

const styles = {
  bottomNav: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    zIndex: 1
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
      case '/notifications':
        tabValue = 3;
        break;
    }
    this.setState({ tabValue: tabValue });
  }

  render() {
    return (
      <Paper style={styles.bottomNav} elevation={20}>
        <BottomNavigation showLabels value={this.state.tabValue}>
          <BottomNavigationAction
            label="HOME"
            icon={<HomeIcon />}
            onClick={this.props.handleHomeClick}
          />
          <BottomNavigationAction
            label="DISCOVER"
            icon={<ExploreIcon />}
            onClick={this.props.handleDiscoverClick}
          />
          <BottomNavigationAction
            label="MAPS"
            icon={<MapIcon />}
            onClick={this.props.handleMapsClick}
          />
          <BottomNavigationAction
            label="NOTICE"
            icon={this.renderNotificationIcon()}
            onClick={this.props.handleNotificationsClick}
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

import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import NoContentsContainer from '../containers/NoContentsContainer';
import NotificationListContainer from '../containers/NotificationListContainer';

const styles = {
  containerLarge: {
    margin: '94px auto 200px',
    maxWidth: 700
  },
  containerSmall: {
    margin: '56px auto 56px'
  },
  progress: {
    textAlign: 'center',
    paddingTop: 40
  }
};

class Notifications extends React.Component {
  componentWillMount() {
    this.props.updatePageTitle();
    if (!this.props.currentUser.isAnonymous) {
      this.props.handleMount();
    }
    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/notifications',
      'page_title': 'Notifications | Qoodish'
    });
  }

  render() {
    return (
      <div
        style={this.props.large ? styles.containerLarge : styles.containerSmall}
      >
        {this.props.loadingNotifications
          ? this.renderProgress()
          : this.renderNotificationsContainer()}
      </div>
    );
  }

  renderNotificationsContainer() {
    if (this.props.notifications.length > 0) {
      return (
        <Paper>
          <NotificationListContainer notifications={this.props.notifications} />
        </Paper>
      );
    } else {
      return (
        <NoContentsContainer
          contentType="notification"
          message="When you received notifications, you will see here."
        />
      );
    }
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }
}

export default Notifications;

import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import NoContentsContainer from '../containers/NoContentsContainer';
import NotificationListContainer from '../containers/NotificationListContainer';
import CreateResourceButtonContainer from '../containers/CreateResourceButtonContainer';

import I18n from '../containers/I18n';

const styles = {
  containerLarge: {
    margin: '94px auto 200px',
    maxWidth: 700
  },
  containerSmall: {
    margin: '56px auto 56px'
  },
  progressLarge: {
    textAlign: 'center',
    paddingTop: 20
  },
  progressSmall: {
    textAlign: 'center',
    paddingTop: 40
  }
};

class Notifications extends React.PureComponent {
  componentDidMount() {
    if (!this.props.currentUser.isAnonymous) {
      this.props.handleMount();
    }
    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/notifications',
      'page_title': `${I18n.t('notifications')} | Qoodish`
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
        {this.props.large && <CreateResourceButtonContainer />}
      </div>
    );
  }

  renderNotificationsContainer() {
    if (this.props.notifications.length > 0) {
      return (
        <Paper>
          <List>
            <NotificationListContainer
              notifications={this.props.notifications}
              handleNotificationClick={() => {}}
              item="list"
            />
          </List>
        </Paper>
      );
    } else {
      return (
        <NoContentsContainer
          contentType="notification"
          message={I18n.t('notifications will see here')}
        />
      );
    }
  }

  renderProgress() {
    return (
      <div style={this.props.large ? styles.progressLarge : styles.progressSmall}>
        <CircularProgress />
      </div>
    );
  }
}

export default Notifications;

import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import NoContents from '../../molecules/NoContents';
import NotificationList from '../../organisms/NotificationList';
import CreateResourceButton from '../../molecules/CreateResourceButton';

import I18n from '../../../utils/I18n';

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
      page_path: '/notifications',
      page_title: `${I18n.t('notifications')} | Qoodish`
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
        {this.props.large && <CreateResourceButton />}
      </div>
    );
  }

  renderNotificationsContainer() {
    if (this.props.notifications.length > 0) {
      return (
        <Paper>
          <List>
            <NotificationList
              notifications={this.props.notifications}
              handleNotificationClick={() => {}}
              item="list"
            />
          </List>
        </Paper>
      );
    } else {
      return (
        <NoContents
          contentType="notification"
          message={I18n.t('notifications will see here')}
        />
      );
    }
  }

  renderProgress() {
    return (
      <div
        style={this.props.large ? styles.progressLarge : styles.progressSmall}
      >
        <CircularProgress />
      </div>
    );
  }
}

export default Notifications;

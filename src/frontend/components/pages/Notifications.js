import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';

import NoContents from '../molecules/NoContents';
import NotificationList from '../organisms/NotificationList';
import CreateResourceButton from '../molecules/CreateResourceButton';

import I18n from '../../utils/I18n';
import ApiClient from '../../utils/ApiClient';
import fetchNotifications from '../../actions/fetchNotifications';

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

const NotificationsContainer = props => {
  if (props.notifications.length > 0) {
    return (
      <Paper>
        <List>
          <NotificationList
            notifications={props.notifications}
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
};

const Notifications = () => {
  const large = useMediaQuery('(min-width: 600px)');

  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      notifications: state.shared.notifications
    }),
    []
  );
  const { currentUser, notifications } = useMappedState(mapState);
  const [loading, setLoading] = useState(true);

  const handleMount = useCallback(async () => {
    if (!currentUser || currentUser.isAnonymous) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const client = new ApiClient();
    let response = await client.fetchNotifications();
    setLoading(false);
    if (response.ok) {
      let json = await response.json();
      dispatch(fetchNotifications(json));
    }
  });

  useEffect(() => {
    handleMount();

    gtag('config', process.env.GA_TRACKING_ID, {
      page_path: '/notifications',
      page_title: `${I18n.t('notifications')} | Qoodish`
    });
  }, []);

  return (
    <div style={large ? styles.containerLarge : styles.containerSmall}>
      {loading ? (
        <div style={large ? styles.progressLarge : styles.progressSmall}>
          <CircularProgress />
        </div>
      ) : (
        <NotificationsContainer notifications={notifications} />
      )}
      {large && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(Notifications);

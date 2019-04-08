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
import fetchNotifications from '../../actions/fetchNotifications';
import { NotificationsApi } from 'qoodish_api';

const styles = {
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
      <Paper elevation={0}>
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
    setLoading(true);

    const apiInstance = new NotificationsApi();

    apiInstance.notificationsGet((error, data, response) => {
      setLoading(false);
      if (response.ok) {
        dispatch(fetchNotifications(response.body));
      }
    });
  });

  useEffect(
    () => {
      if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
        setLoading(false);
        return;
      }
      handleMount();

      gtag('config', process.env.GA_TRACKING_ID, {
        page_path: '/notifications',
        page_title: `${I18n.t('notifications')} | Qoodish`
      });
    },
    [currentUser.uid]
  );

  return (
    <div>
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

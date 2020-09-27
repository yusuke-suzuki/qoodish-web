import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';

import NoContents from '../molecules/NoContents';
import NotificationList from '../organisms/NotificationList';
import CreateResourceButton from '../molecules/CreateResourceButton';

import updateMetadata from '../../actions/updateMetadata';
import I18n from '../../utils/I18n';
import fetchNotifications from '../../actions/fetchNotifications';
import {
  ApiClient,
  NotificationsApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '@material-ui/core';

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
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const dispatch = useDispatch();

  const { currentUser } = useContext(AuthContext);

  const mapState = useCallback(
    state => ({
      notifications: state.shared.notifications
    }),
    []
  );
  const { notifications } = useMappedState(mapState);
  const [loading, setLoading] = useState(true);

  const handleMount = useCallback(async () => {
    setLoading(true);

    const apiInstance = new NotificationsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.notificationsGet((error, data, response) => {
      setLoading(false);
      if (response.ok) {
        dispatch(fetchNotifications(response.body));
      }
    });
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
      setLoading(false);
      return;
    }
    handleMount();
  }, [currentUser]);

  useEffect(() => {
    const metadata = {
      title: `${I18n.t('notifications')} | Qoodish`,
      url: `${process.env.ENDPOINT}/notifications`
    };
    dispatch(updateMetadata(metadata));
  }, []);

  return (
    <div>
      {loading ? (
        <div style={smUp ? styles.progressLarge : styles.progressSmall}>
          <CircularProgress />
        </div>
      ) : (
        <NotificationsContainer notifications={notifications} />
      )}
      {smUp && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(Notifications);

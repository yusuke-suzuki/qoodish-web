import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';

import I18n from '../../utils/I18n';
import fetchNotifications from '../../actions/fetchNotifications';
import {
  ApiClient,
  NotificationsApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import { Grid, makeStyles, useTheme } from '@material-ui/core';
import NotificationList from '../../components/organisms/NotificationList';
import NoContents from '../../components/molecules/NoContents';
import CreateResourceButton from '../../components/molecules/CreateResourceButton';
import Layout from '../../components/Layout';
import Head from 'next/head';

const useStyles = makeStyles(theme => ({
  buttonGroup: {
    position: 'fixed',
    zIndex: 1,
    bottom: theme.spacing(4),
    right: theme.spacing(4)
  },
  progress: {
    textAlign: 'center',
    paddingTop: theme.spacing(5),
    [theme.breakpoints.up('sm')]: {
      paddingTop: 20
    }
  }
}));

const Notifications = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const classes = useStyles();

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

  return (
    <Layout hideBottomNav={false} fullWidth={false}>
      <Head>
        <title>{`${I18n.t('notifications')} | Qoodish`}</title>
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/notifications`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/notifications?hl=en`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/notifications?hl=ja`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/notifications`}
          hrefLang="x-default"
        />
        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip"
        />
        <meta name="title" content={`${I18n.t('notifications')} | Qoodish`} />
        <meta name="description" content={I18n.t('meta description')} />
        <meta
          property="og:title"
          content={`${I18n.t('notifications')} | Qoodish`}
        />
        <meta property="og:description" content={I18n.t('meta description')} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}/notifications`}
        />
        <meta property="og:image" content={process.env.NEXT_PUBLIC_OGP_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content={process.env.NEXT_PUBLIC_OGP_IMAGE}
        />
        <meta
          name="twitter:title"
          content={`${I18n.t('notifications')} | Qoodish`}
        />
        <meta name="twitter:description" content={I18n.t('meta description')} />
        <meta property="og:locale" content={I18n.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      {loading ? (
        <div className={classes.progress}>
          <CircularProgress />
        </div>
      ) : notifications.length > 0 ? (
        <Paper elevation={0}>
          <List>
            <NotificationList
              notifications={notifications}
              handleNotificationClick={() => {}}
            />
          </List>
        </Paper>
      ) : (
        <NoContents
          contentType="notification"
          message={I18n.t('notifications will see here')}
        />
      )}

      {smUp && (
        <div className={classes.buttonGroup}>
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <CreateResourceButton />
            </Grid>
          </Grid>
        </div>
      )}
    </Layout>
  );
};

export default React.memo(Notifications);

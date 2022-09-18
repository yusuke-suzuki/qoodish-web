import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import fetchNotifications from '../../actions/fetchNotifications';
import {
  ApiClient,
  NotificationsApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import {
  CircularProgress,
  Grid,
  List,
  makeStyles,
  Paper,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import NotificationList from '../../components/organisms/NotificationList';
import NoContents from '../../components/molecules/NoContents';
import CreateResourceButton from '../../components/molecules/CreateResourceButton';
import Layout from '../../components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLocale } from '../../hooks/useLocale';

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
  const router = useRouter();
  const { I18n } = useLocale();
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

  const title = `${I18n.t('notifications')} | Qoodish`;
  const description = I18n.t('meta description');
  const thumbnailUrl = process.env.NEXT_PUBLIC_OGP_IMAGE_URL;
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;

  return (
    <Layout hideBottomNav={false} fullWidth={false}>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}${router.pathname}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${router.pathname}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/ja${router.pathname}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${router.pathname}`}
          hrefLang="x-default"
        />

        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip"
        />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}${router.pathname}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
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

export default memo(Notifications);

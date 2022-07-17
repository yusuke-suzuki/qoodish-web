import { useEffect, useCallback, useContext, memo } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import fetchFollowingMaps from '../../actions/fetchFollowingMaps';
import fetchMyProfile from '../../actions/fetchMyProfile';
import clearProfileState from '../../actions/clearProfileState';

import {
  ApiClient,
  UserMapsApi,
  UsersApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import SharedProfile from '../../components/organisms/SharedProfile';
import Layout from '../../components/Layout';
import Head from 'next/head';
import { Grid, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import CreateResourceButton from '../../components/molecules/CreateResourceButton';
import { useRouter } from 'next/router';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(theme => ({
  buttonGroup: {
    position: 'fixed',
    zIndex: 1,
    bottom: theme.spacing(4),
    right: theme.spacing(4)
  }
}));

const Profile = () => {
  const router = useRouter();
  const { I18n } = useLocale();
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const mapState = useCallback(
    state => ({
      profile: state.app.profile
    }),
    []
  );

  const { profile } = useMappedState(mapState);

  const { currentUser } = useContext(AuthContext);

  const initProfile = useCallback(async () => {
    const apiInstance = new UsersApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.usersUserIdGet(currentUser.uid, (error, data, response) => {
      if (response.ok) {
        console.log(response);
        dispatch(fetchMyProfile(response.body));
      }
    });
  }, [dispatch, currentUser]);

  const initFollowingMaps = useCallback(async () => {
    const apiInstance = new UserMapsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
    const opts = {
      following: true
    };

    apiInstance.usersUserIdMapsGet(
      currentUser.uid,
      opts,
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchFollowingMaps(response.body));
        } else {
          console.log('API called successfully. Returned data: ' + data);
        }
      }
    );
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
      return;
    }

    initProfile();
    initFollowingMaps();

    return () => {
      dispatch(clearProfileState());
    };
  }, [currentUser]);

  const title = `${I18n.t('account')} | Qoodish`;
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

        <meta name="robots" content="noindex" />

        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip"
        />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}${router.pathname}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      <SharedProfile profile={profile} />

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

export default memo(Profile);

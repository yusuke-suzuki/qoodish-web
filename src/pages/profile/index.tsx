import React, { useEffect, useCallback, useContext } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import I18n from '../../utils/I18n';

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

const useStyles = makeStyles(theme => ({
  buttonGroup: {
    position: 'fixed',
    zIndex: 1,
    bottom: theme.spacing(4),
    right: theme.spacing(4)
  }
}));

const Profile = () => {
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

  return (
    <Layout hideBottomNav={false} fullWidth={false}>
      <Head>
        {profile && profile.name && (
          <title>{`${I18n.t('account')} | Qoodish`}</title>
        )}
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/profile`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/profile?hl=en`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/profile?hl=ja`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/profile`}
          hrefLang="x-default"
        />
        <meta name="robots" content="noindex" />
        {profile && profile.name && (
          <meta
            name="keywords"
            content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip"
          />
        )}
        {profile && profile.name && (
          <meta name="title" content={`${I18n.t('account')} | Qoodish`} />
        )}
        {profile && profile.name && (
          <meta name="description" content={I18n.t('meta description')} />
        )}
        {profile && profile.name && (
          <meta
            property="og:title"
            content={`${I18n.t('account')} | Qoodish`}
          />
        )}
        {profile && profile.name && (
          <meta
            property="og:description"
            content={I18n.t('meta description')}
          />
        )}
        {profile && profile.name && (
          <meta
            property="og:url"
            content={`${process.env.NEXT_PUBLIC_ENDPOINT}/profile`}
          />
        )}
        {profile && profile.name && (
          <meta property="og:image" content={profile.thumbnail_url} />
        )}
        <meta name="twitter:card" content="summary" />
        {profile && profile.name && (
          <meta name="twitter:image" content={profile.thumbnail_url} />
        )}
        {profile && profile.name && (
          <meta
            name="twitter:title"
            content={`${I18n.t('account')} | Qoodish`}
          />
        )}
        {profile && profile.name && (
          <meta
            name="twitter:description"
            content={I18n.t('meta description')}
          />
        )}
        <meta property="og:locale" content={I18n.locale} />
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

export default React.memo(Profile);

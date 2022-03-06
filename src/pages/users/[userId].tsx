import React, { useEffect, useCallback, useContext } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import fetchFollowingMaps from '../../actions/fetchFollowingMaps';
import fetchUserProfile from '../../actions/fetchUserProfile';
import clearProfileState from '../../actions/clearProfileState';

import {
  ApiClient,
  UserMapsApi,
  UsersApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import SharedProfile from '../../components/organisms/SharedProfile';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Head from 'next/head';
import I18n from '../../utils/I18n';

const UserProfile = () => {
  const router = useRouter();
  const { userId } = router.query;
  const dispatch = useDispatch();

  const { currentUser } = useContext(AuthContext);

  const mapState = useCallback(
    state => ({
      profile: state.profile.currentUser
    }),
    []
  );

  const { profile } = useMappedState(mapState);

  const initProfile = useCallback(async () => {
    const apiInstance = new UsersApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.usersUserIdGet(userId, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchUserProfile(response.body));
      }
    });
  }, [dispatch, userId, currentUser]);

  const initFollowingMaps = useCallback(async () => {
    const apiInstance = new UserMapsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
    const opts = {
      following: true
    };

    apiInstance.usersUserIdMapsGet(userId, opts, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchFollowingMaps(response.body));
      } else {
        console.log('API called successfully. Returned data: ' + data);
      }
    });
  }, [dispatch, userId, currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid || !userId) {
      return;
    }

    initProfile();
    initFollowingMaps();

    return () => {
      dispatch(clearProfileState());
    };
  }, [currentUser, userId]);

  return (
    <Layout hideBottomNav={true} fullWidth={false}>
      <Head>
        {profile && profile.name && (
          <title>{`${profile.name} | Qoodish`}</title>
        )}
        {profile && profile.name && (
          <link
            rel="canonical"
            href={`${process.env.ENDPOINT}/users/${profile.id}`}
          />
        )}
        {profile && profile.name && (
          <link
            rel="alternate"
            href={`${process.env.NEXT_PUBLIC_ENDPOINT}/users/${profile.id}?hl=en`}
            hrefLang="en"
          />
        )}
        {profile && profile.name && (
          <link
            rel="alternate"
            href={`${process.env.NEXT_PUBLIC_ENDPOINT}/users/${profile.id}?hl=ja`}
            hrefLang="ja"
          />
        )}
        {profile && profile.name && (
          <link
            rel="alternate"
            href={`${process.env.NEXT_PUBLIC_ENDPOINT}/users/${profile.id}`}
            hrefLang="x-default"
          />
        )}
        <meta name="robots" content="noindex" />
        {profile && profile.name && (
          <meta
            name="keywords"
            content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip"
          />
        )}
        {profile && profile.name && (
          <meta name="title" content={`${profile.name} | Qoodish`} />
        )}
        {profile && profile.name && (
          <meta name="description" content={I18n.t('meta description')} />
        )}
        {profile && profile.name && (
          <meta property="og:title" content={`${profile.name} | Qoodish`} />
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
            content={`${process.env.ENDPOINT}/users/${profile.id}`}
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
          <meta name="twitter:title" content={`${profile.name} | Qoodish`} />
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
    </Layout>
  );
};

export default React.memo(UserProfile);

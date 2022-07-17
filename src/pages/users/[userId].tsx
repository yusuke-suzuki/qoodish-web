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
import { useLocale } from '../../hooks/useLocale';

const UserProfile = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { I18n } = useLocale();
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

  const title =
    profile && profile.name ? `${profile.name} | Qoodish` : 'Qoodish';
  const description = I18n.t('meta description');
  const thumbnailUrl = process.env.NEXT_PUBLIC_OGP_IMAGE_URL;
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;

  return (
    <Layout hideBottomNav={true} fullWidth={false}>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/users/${userId}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/users/${userId}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/ja/users/${userId}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/users/${userId}`}
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
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/users/${userId}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      <SharedProfile profile={profile} />
    </Layout>
  );
};

export default React.memo(UserProfile);

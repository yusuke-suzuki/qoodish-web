import React, { useEffect, useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import SharedProfile from '../organisms/SharedProfile';
import Helmet from 'react-helmet';
import I18n from '../../utils/I18n';

import fetchFollowingMaps from '../../actions/fetchFollowingMaps';
import fetchMyProfile from '../../actions/fetchMyProfile';
import clearProfileState from '../../actions/clearProfileState';

import { UserMapsApi, UsersApi } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';

const ProfileHelmet = () => {
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      pathname: state.shared.currentLocation
    }),
    []
  );

  const { currentUser, pathname } = useMappedState(mapState);

  return (
    <Helmet
      title={`${I18n.t('account')} | Qoodish`}
      link={[
        {
          rel: 'canonical',
          href: `${process.env.ENDPOINT}${pathname}`
        }
      ]}
      meta={[
        {
          name: 'title',
          content: `${I18n.t('account')} | Qoodish`
        },
        {
          name: 'twitter:title',
          content: `${I18n.t('account')} | Qoodish`
        },
        { name: 'twitter:image', content: currentUser.thumbnail_url },
        {
          property: 'og:title',
          content: `${I18n.t('account')} | Qoodish`
        },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:url',
          content: `${process.env.ENDPOINT}${pathname}`
        }
      ]}
    />
  );
};

const Profile = () => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  const initProfile = useCallback(async () => {
    if (currentUser.isAnonymous) {
      return;
    }
    await initializeApiClient();
    const apiInstance = new UsersApi();

    apiInstance.usersUserIdGet(currentUser.uid, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchMyProfile(response.body));
      }
    });
  });

  const initFollowingMaps = useCallback(async () => {
    if (currentUser.isAnonymous) {
      return;
    }
    await initializeApiClient();

    const apiInstance = new UserMapsApi();
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
  });

  useEffect(() => {
    initProfile();
    initFollowingMaps();

    gtag('config', process.env.GA_TRACKING_ID, {
      page_path: '/profile',
      page_title: `${I18n.t('account')} | Qoodish`
    });

    return () => {
      dispatch(clearProfileState());
    };
  }, []);

  return (
    <div>
      {currentUser && currentUser.name && <ProfileHelmet />}
      <SharedProfile currentUser={currentUser} />
    </div>
  );
};

export default React.memo(Profile);

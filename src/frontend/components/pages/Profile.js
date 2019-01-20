import React, { useEffect, useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import SharedProfile from '../organisms/SharedProfile';
import Helmet from 'react-helmet';
import I18n from '../../utils/I18n';
import ApiClient from '../../utils/ApiClient';

import fetchFollowingMaps from '../../actions/fetchFollowingMaps';
import fetchMyProfile from '../../actions/fetchMyProfile';
import clearProfileState from '../../actions/clearProfileState';

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
    const client = new ApiClient();
    let response = await client.fetchUser();
    let user = await response.json();
    dispatch(fetchMyProfile(user));
  });

  const initFollowingMaps = useCallback(async () => {
    if (currentUser.isAnonymous) {
      return;
    }
    const client = new ApiClient();
    let response = await client.fetchFollowingMaps();
    let maps = await response.json();
    dispatch(fetchFollowingMaps(maps));
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

import React, { useEffect, useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import SharedProfile from '../organisms/SharedProfile';
import Helmet from 'react-helmet';

import ApiClient from '../../utils/ApiClient';
import I18n from '../../utils/I18n';

import fetchFollowingMaps from '../../actions/fetchFollowingMaps';
import fetchUserProfile from '../../actions/fetchUserProfile';
import clearProfileState from '../../actions/clearProfileState';

const ProfileHelmet = () => {
  const mapState = useCallback(
    state => ({
      currentUser: state.profile.currentUser,
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

const UserProfile = props => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentUser: state.profile.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  const initProfile = useCallback(async () => {
    const client = new ApiClient();
    let response = await client.fetchUser(props.params.primaryId);
    let user = await response.json();
    dispatch(fetchUserProfile(user));
  });

  const initFollowingMaps = useCallback(async () => {
    const client = new ApiClient();
    let response = await client.fetchFollowingMaps(props.params.primaryId);
    let maps = await response.json();
    dispatch(fetchFollowingMaps(maps));
  });

  useEffect(() => {
    initProfile();
    initFollowingMaps();

    if (currentUser.name) {
      gtag('config', process.env.GA_TRACKING_ID, {
        page_path: `/users/${currentUser.id}`,
        page_title: `${currentUser.name} | Qoodish`
      });
    }

    return () => {
      dispatch(clearProfileState());
    };
  }, []);

  return (
    <div>
      {currentUser.name && <ProfileHelmet />}
      <SharedProfile {...props} currentUser={currentUser} />
    </div>
  );
};

export default React.memo(UserProfile);

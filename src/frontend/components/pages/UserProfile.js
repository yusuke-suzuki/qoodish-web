import React, { useEffect, useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import SharedProfile from '../organisms/SharedProfile';
import Helmet from 'react-helmet';

import I18n from '../../utils/I18n';

import fetchFollowingMaps from '../../actions/fetchFollowingMaps';
import fetchUserProfile from '../../actions/fetchUserProfile';
import clearProfileState from '../../actions/clearProfileState';

import { UserMapsApi, UsersApi } from 'qoodish_api';

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
      currentUser: state.app.currentUser,
      profile: state.profile.currentUser
    }),
    []
  );

  const { currentUser, profile } = useMappedState(mapState);

  const initProfile = useCallback(async () => {
    const apiInstance = new UsersApi();

    apiInstance.usersUserIdGet(
      props.params.primaryId,
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchUserProfile(response.body));
        }
      }
    );
  });

  const initFollowingMaps = useCallback(async () => {
    const apiInstance = new UserMapsApi();
    const opts = {
      following: true
    };

    apiInstance.usersUserIdMapsGet(
      props.params.primaryId,
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

  useEffect(
    () => {
      if (!currentUser || !currentUser.uid) {
        return;
      }

      initProfile();
      initFollowingMaps();

      if (profile.name) {
        gtag('config', process.env.GA_TRACKING_ID, {
          page_path: `/users/${profile.id}`,
          page_title: `${profile.name} | Qoodish`
        });
      }

      return () => {
        dispatch(clearProfileState());
      };
    },
    [currentUser.uid]
  );

  return (
    <div>
      {currentUser.name && <ProfileHelmet />}
      <SharedProfile {...props} currentUser={profile} />
    </div>
  );
};

export default React.memo(UserProfile);

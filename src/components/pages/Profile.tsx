import React, { useEffect, useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import SharedProfile from '../organisms/SharedProfile';
import I18n from '../../utils/I18n';

import fetchFollowingMaps from '../../actions/fetchFollowingMaps';
import fetchMyProfile from '../../actions/fetchMyProfile';
import clearProfileState from '../../actions/clearProfileState';
import updateMetadata from '../../actions/updateMetadata';

import { UserMapsApi, UsersApi } from '@yusuke-suzuki/qoodish-api-js-client';

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
    const apiInstance = new UsersApi();

    apiInstance.usersUserIdGet(currentUser.uid, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchMyProfile(response.body));
      }
    });
  });

  const initFollowingMaps = useCallback(async () => {
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
    if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
      return;
    }

    initProfile();
    initFollowingMaps();

    return () => {
      dispatch(clearProfileState());
    };
  }, [currentUser.uid]);

  useEffect(() => {
    if (!currentUser || !currentUser.name) {
      return;
    }
    const metadata = {
      title: `${I18n.t('account')} | Qoodish`,
      twitterCard: 'summary',
      image: currentUser.thumbnail_url,
      url: `${process.env.ENDPOINT}/profile`
    };
    dispatch(updateMetadata(metadata));
  }, [currentUser]);

  return <SharedProfile currentUser={currentUser} />;
};

export default React.memo(Profile);

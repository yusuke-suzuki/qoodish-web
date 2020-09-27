import React, { useEffect, useCallback, useContext } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import SharedProfile from '../organisms/SharedProfile';
import I18n from '../../utils/I18n';

import fetchFollowingMaps from '../../actions/fetchFollowingMaps';
import fetchMyProfile from '../../actions/fetchMyProfile';
import clearProfileState from '../../actions/clearProfileState';
import updateMetadata from '../../actions/updateMetadata';

import {
  ApiClient,
  UserMapsApi,
  UsersApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';

const Profile = () => {
  const dispatch = useDispatch();
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

  useEffect(() => {
    if (!profile || !profile.name) {
      return;
    }
    const metadata = {
      title: `${I18n.t('account')} | Qoodish`,
      twitterCard: 'summary',
      image: profile.thumbnail_url,
      url: `${process.env.ENDPOINT}/profile`
    };
    dispatch(updateMetadata(metadata));
  }, [profile]);

  return <SharedProfile profile={profile} />;
};

export default React.memo(Profile);

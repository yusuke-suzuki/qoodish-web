import React, { useEffect, useCallback, useContext } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import SharedProfile from '../organisms/SharedProfile';

import fetchFollowingMaps from '../../actions/fetchFollowingMaps';
import fetchUserProfile from '../../actions/fetchUserProfile';
import clearProfileState from '../../actions/clearProfileState';
import updateMetadata from '../../actions/updateMetadata';

import {
  ApiClient,
  UserMapsApi,
  UsersApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';

const UserProfile = props => {
  const { params } = props;
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

    apiInstance.usersUserIdGet(params.userId, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchUserProfile(response.body));
      }
    });
  }, [dispatch, params, currentUser]);

  const initFollowingMaps = useCallback(async () => {
    const apiInstance = new UserMapsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
    const opts = {
      following: true
    };

    apiInstance.usersUserIdMapsGet(
      params.userId,
      opts,
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchFollowingMaps(response.body));
        } else {
          console.log('API called successfully. Returned data: ' + data);
        }
      }
    );
  }, [dispatch, params, currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
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
      title: `${profile.name} | Qoodish`,
      twitterCard: 'summary',
      image: profile.thumbnail_url,
      url: `${process.env.ENDPOINT}/users/${profile.id}`
    };
    dispatch(updateMetadata(metadata));
  }, [profile]);

  return <SharedProfile {...props} profile={profile} />;
};

export default React.memo(UserProfile);

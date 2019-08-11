import React, { useEffect, useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import SharedProfile from '../organisms/SharedProfile';

import fetchFollowingMaps from '../../actions/fetchFollowingMaps';
import fetchUserProfile from '../../actions/fetchUserProfile';
import clearProfileState from '../../actions/clearProfileState';
import updateMetadata from '../../actions/updateMetadata';

import { UserMapsApi, UsersApi } from 'qoodish_api';

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

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }

    initProfile();
    initFollowingMaps();

    return () => {
      dispatch(clearProfileState());
    };
  }, [currentUser.uid]);

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

  return <SharedProfile {...props} currentUser={profile} />;
};

export default React.memo(UserProfile);

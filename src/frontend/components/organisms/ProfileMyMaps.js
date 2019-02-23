import React, { useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import MapCollection from './MapCollection';
import NoContents from '../molecules/NoContents';

import fetchMyMaps from '../../actions/fetchMyMaps';
import I18n from '../../utils/I18n';

import { UserMapsApi } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';

const ProfileMyMaps = props => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      myMaps: state.profile.myMaps,
      location: state.shared.currentLocation
    }),
    []
  );

  const currentUser = props.currentUser;

  const { myMaps, location } = useMappedState(mapState);

  const initMaps = useCallback(async () => {
    if (
      !currentUser ||
      (location && location.pathname === '/profile' && currentUser.isAnonymous)
    ) {
      return;
    }

    const userId =
      location && location.pathname === '/profile'
        ? currentUser.uid
        : props.params.primaryId;

    await initializeApiClient();

    const apiInstance = new UserMapsApi();

    apiInstance.usersUserIdMapsGet(userId, {}, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchMyMaps(response.body));
      } else {
        console.log('API called successfully. Returned data: ' + data);
      }
    });
  });

  useEffect(() => {
    initMaps();
  }, []);

  return myMaps.length > 0 ? (
    <MapCollection maps={myMaps} />
  ) : (
    <NoContents
      contentType="map"
      action="create-map"
      message={I18n.t('maps will see here')}
      secondaryAction="discover-maps"
    />
  );
};

export default React.memo(ProfileMyMaps);

import React, { useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import MapCollection from './MapCollection';
import fetchMyMaps from '../../actions/fetchMyMaps';
import { UserMapsApi } from '@yusuke-suzuki/qoodish-api-js-client';

const ProfileMyMaps = props => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      myMaps: state.profile.myMaps,
      location: state.shared.currentLocation
    }),
    []
  );

  const { currentUser, myMaps, location } = useMappedState(mapState);

  const initMaps = useCallback(async () => {
    if (
      location &&
      location.pathname === '/profile' &&
      currentUser.isAnonymous
    ) {
      return;
    }

    const userId =
      props.params && props.params.userId
        ? props.params.userId
        : currentUser.uid;

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
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initMaps();
  }, [currentUser.uid]);

  return <MapCollection maps={myMaps} skeletonSize={3} />;
};

export default React.memo(ProfileMyMaps);

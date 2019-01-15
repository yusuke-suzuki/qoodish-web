import React, { useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import MapCollection from './MapCollection';
import NoContents from '../molecules/NoContents';

import fetchMyMaps from '../../actions/fetchMyMaps';
import I18n from '../../utils/I18n';
import ApiClient from '../../utils/ApiClient';

const ProfileMyMaps = props => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      myMaps: state.profile.myMaps,
      pathname: state.shared.currentLocation
    }),
    []
  );

  const { myMaps, pathname } = useMappedState(mapState);

  const initMaps = useCallback(async () => {
    const client = new ApiClient();
    let userId =
      pathname === '/profile' ? undefined : props.match.params.userId;
    let response = await client.fetchMyMaps(userId);
    let maps = await response.json();
    dispatch(fetchMyMaps(maps));
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

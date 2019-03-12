import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import CircularProgress from '@material-ui/core/CircularProgress';

import MapCollection from './MapCollection';
import NoContents from '../molecules/NoContents';

import fetchMyMaps from '../../actions/fetchMyMaps';
import I18n from '../../utils/I18n';

import { UserMapsApi } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';

const styles = {
  progress: {
    textAlign: 'center',
    padding: 20,
    marginTop: 20
  }
};

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

  const [loading, setLoading] = useState(true);

  const initMaps = useCallback(async () => {
    if (
      !currentUser ||
      (location && location.pathname === '/profile' && currentUser.isAnonymous)
    ) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const userId =
      props.params && props.params.primaryId
        ? props.params.primaryId
        : currentUser.uid;

    await initializeApiClient();

    const apiInstance = new UserMapsApi();

    apiInstance.usersUserIdMapsGet(userId, {}, (error, data, response) => {
      setLoading(false);
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

  if (loading) {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  } else {
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
  }
};

export default React.memo(ProfileMyMaps);

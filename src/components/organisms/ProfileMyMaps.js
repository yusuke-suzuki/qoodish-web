import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import MapCollection from './MapCollection';
import fetchMyMaps from '../../actions/fetchMyMaps';
import { UserMapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import SkeletonMapCollection from './SkeletonMapCollection';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import NoContents from '../molecules/NoContents';
import I18n from '../../utils/I18n';

const ProfileMyMaps = props => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
      return;
    }

    const userId =
      props.params && props.params.userId
        ? props.params.userId
        : currentUser.uid;

    const apiInstance = new UserMapsApi();

    apiInstance.usersUserIdMapsGet(userId, {}, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        dispatch(fetchMyMaps(response.body));
      }
    });
  });

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initMaps();
  }, [currentUser.uid]);

  if (!loading && myMaps.length < 1) {
    return (
      <NoContents
        contentType="map"
        action="create-map"
        secondaryAction="discover-maps"
        message={I18n.t('maps will see here')}
      />
    );
  }

  return (
    <div>
      {loading ? (
        <SkeletonMapCollection size={large ? 3 : 4} />
      ) : (
        <MapCollection maps={myMaps} />
      )}
    </div>
  );
};

export default React.memo(ProfileMyMaps);

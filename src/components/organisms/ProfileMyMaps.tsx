import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import MapCollection from './MapCollection';
import fetchMyMaps from '../../actions/fetchMyMaps';
import { UserMapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import SkeletonMapCollection from './SkeletonMapCollection';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import NoContents from '../molecules/NoContents';
import I18n from '../../utils/I18n';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '@material-ui/core';

const ProfileMyMaps = props => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const [loading, setLoading] = useState(true);

  const { currentUser } = useContext(AuthContext);

  const mapState = useCallback(
    state => ({
      myMaps: state.profile.myMaps,
      location: state.shared.currentLocation
    }),
    []
  );

  const { myMaps, location } = useMappedState(mapState);
  const { params } = props;

  const initMaps = useCallback(async () => {
    if (
      location &&
      location.pathname === '/profile' &&
      currentUser.isAnonymous
    ) {
      setLoading(false);
      return;
    }

    const userId = params && params.userId ? params.userId : currentUser.uid;

    const apiInstance = new UserMapsApi();

    apiInstance.usersUserIdMapsGet(userId, {}, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        dispatch(fetchMyMaps(response.body));
      }
    });
  }, [dispatch, params, currentUser, location]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initMaps();
  }, [currentUser]);

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

  return loading ? (
    <SkeletonMapCollection size={smUp ? 3 : 4} />
  ) : (
    <MapCollection maps={myMaps} />
  );
};

export default React.memo(ProfileMyMaps);

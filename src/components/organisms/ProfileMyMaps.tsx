import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import MapCollection from './MapCollection';
import fetchMyMaps from '../../actions/fetchMyMaps';
import { ApiClient, UserMapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import SkeletonMapCollection from './SkeletonMapCollection';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import NoContents from '../molecules/NoContents';
import I18n from '../../utils/I18n';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '@material-ui/core';
import { useRouter } from 'next/router';

type Props = {
  userId?: string;
};

const ProfileMyMaps = (props: Props) => {
  const { userId } = props;

  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const { currentUser } = useContext(AuthContext);

  const mapState = useCallback(
    state => ({
      myMaps: state.profile.myMaps
    }),
    []
  );

  const { myMaps } = useMappedState(mapState);

  const initMaps = useCallback(async () => {
    if (router.pathname === '/profile' && currentUser.isAnonymous) {
      setLoading(false);
      return;
    }

    const uid = userId ? userId : currentUser.uid;

    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
    const apiInstance = new UserMapsApi();

    apiInstance.usersUserIdMapsGet(uid, {}, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        dispatch(fetchMyMaps(response.body));
      }
    });
  }, [dispatch, userId, currentUser, router]);

  useEffect(() => {
    if (currentUser && userId) {
      initMaps();
    }
  }, [currentUser, userId]);

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

import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { useDispatch } from 'redux-react-hook';
import AuthContext from '../context/AuthContext';
import { UsersApi, ApiClient } from '@yusuke-suzuki/qoodish-api-js-client';
import fetchMyProfile from '../actions/fetchMyProfile';
import { Loader } from '@googlemaps/js-api-loader';
import { usePushManager } from '../hooks/usePushManager';

type Props = {
  children: any;
};

export default memo(function AppPortal(props: Props) {
  const { children } = props;

  const [googleMapsApiLoaded, setGoogleMapsApiLoaded] = useState<boolean>(
    false
  );

  const { currentUser } = useContext(AuthContext);

  usePushManager();

  const dispatch = useDispatch();

  const initGoogleMapsApi = useCallback(async () => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      region: 'JP',
      language: 'ja'
    });
    await loader.load();

    setGoogleMapsApiLoaded(true);
  }, []);

  const getProfile = useCallback(async () => {
    const apiInstance = new UsersApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.usersUserIdGet(currentUser.uid, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchMyProfile(response.body));
      } else {
        console.log('Fetch profile failed.');
      }
    });
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (googleMapsApiLoaded) {
      return;
    }

    initGoogleMapsApi();
  }, []);

  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous) {
      getProfile();
    }
  }, [currentUser]);

  return <>{googleMapsApiLoaded ? <>{children}</> : null}</>;
});

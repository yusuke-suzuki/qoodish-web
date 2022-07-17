import React, { memo, useContext, useEffect } from 'react';
import { useDispatch } from 'redux-react-hook';
import AuthContext from '../context/AuthContext';
import fetchMyProfile from '../actions/fetchMyProfile';
import { usePushManager } from '../hooks/usePushManager';
import { useProfile } from '../hooks/useProfile';

type Props = {
  children: any;
};

export default memo(function AppPortal(props: Props) {
  const { children } = props;

  const { currentUser } = useContext(AuthContext);

  usePushManager();

  const { profile } = useProfile(currentUser);

  const dispatch = useDispatch();

  useEffect(() => {
    if (profile) {
      dispatch(fetchMyProfile(profile));
    }
  }, [profile]);

  return <>{children}</>;
});

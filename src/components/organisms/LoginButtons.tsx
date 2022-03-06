import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'redux-react-hook';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import { useIOS } from '../../utils/detectDevice';
import sleep from '../../utils/sleep';
import I18n from '../../utils/I18n';

import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

import { UsersApi, NewUser } from '@yusuke-suzuki/qoodish-api-js-client';
import closeSignInRequiredDialog from '../../actions/closeSignInRequiredDialog';
import fetchMyProfile from '../../actions/fetchMyProfile';
import { useRouter } from 'next/router';

import * as firebaseui from 'firebaseui';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';

const LoginButtons = props => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { nextPath } = props;
  const [firebaseAuth, setFirebaseAuth] = useState(undefined);
  const [uiConfig, setUiConfig] = useState(undefined);

  const initFirebase = useCallback(async () => {
    const auth = getAuth();
    setFirebaseAuth(auth);

    setUiConfig({
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          handleSignIn(authResult, redirectUrl);
        }
      },
      signInFlow: useIOS() ? 'redirect' : 'popup',
      signInSuccessUrl: process.env.NEXT_PUBLIC_ENDPOINT,
      signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
        {
          provider: FacebookAuthProvider.PROVIDER_ID,
          scopes: ['public_profile', 'email']
        },
        TwitterAuthProvider.PROVIDER_ID,
        GithubAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
      ],
      tosUrl: `${process.env.NEXT_PUBLIC_ENDPOINT}/terms`,
      privacyPolicyUrl: `${process.env.NEXT_PUBLIC_ENDPOINT}/privacy`
    });
  }, []);

  useEffect(() => {
    initFirebase();
  }, []);

  const handleSignIn = useCallback(
    async (authResult, _redirectUrl) => {
      dispatch(closeSignInRequiredDialog());
      const currentUser = authResult.user;

      if (currentUser.isAnonymous) {
        if (nextPath) {
          router.push(nextPath);
        }

        return;
      }

      dispatch(requestStart());

      const accessToken = await currentUser.getIdToken();

      const params = {
        uid: currentUser.uid,
        token: accessToken,
        display_name: currentUser.displayName
      };

      const apiInstance = new UsersApi();
      const newUser = NewUser.constructFromObject(params);

      apiInstance.usersPost(newUser, async (error, data, response) => {
        dispatch(requestFinish());

        if (response.ok) {
          if (nextPath) {
            router.push(nextPath);
          }

          dispatch(openToast(I18n.t('sign in success')));

          const analytics = getAnalytics();

          logEvent(analytics, 'login', {
            method: authResult.additionalUserInfo.providerId
          });

          // wait until thumbnail created on cloud function
          await sleep(3000);
          dispatch(fetchMyProfile(response.body));
        } else {
          dispatch(openToast(response.body.detail));
        }
      });
    },
    [dispatch, router, nextPath, getAnalytics, logEvent]
  );

  return uiConfig && firebaseAuth ? (
    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebaseAuth} />
  ) : null;
};

export default React.memo(LoginButtons);

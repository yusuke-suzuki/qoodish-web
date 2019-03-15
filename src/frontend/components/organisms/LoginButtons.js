import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import getFirebase from '../../utils/getFirebase';
import getFirebaseAuth from '../../utils/getFirebaseAuth';
import getFirebaseUi from '../../utils/getFirebaseUi';
import { useIOS } from '../../utils/detectDevice';
import uploadToStorage from '../../utils/uploadToStorage';
import downloadImage from '../../utils/downloadImage';
import sleep from '../../utils/sleep';
import I18n from '../../utils/I18n';

import signIn from '../../actions/signIn';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

import { UsersApi, NewUser } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';

const LoginButtons = () => {
  const dispatch = useDispatch();

  const [firebaseAuth, setFirebaseAuth] = useState(undefined);
  const [uiConfig, setUiConfig] = useState(undefined);

  const mapState = useCallback(
    state => ({
      history: state.shared.history
    }),
    []
  );
  const { history } = useMappedState(mapState);

  const initFirebase = useCallback(async () => {
    await getFirebaseAuth();
    const firebase = await getFirebase();
    const firebaseui = await getFirebaseUi();

    setFirebaseAuth(firebase.auth());

    setUiConfig({
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          handleSignIn(authResult, redirectUrl);
        }
      },
      signInFlow: useIOS() ? 'redirect' : 'popup',
      signInSuccessUrl: process.env.ENDPOINT,
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        {
          provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          scopes: ['public_profile', 'email']
        },
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
      ],
      tosUrl: `${process.env.ENDPOINT}/terms`,
      privacyPolicyUrl: `${process.env.ENDPOINT}/privacy`
    });
  });

  useEffect(() => {
    initFirebase();
  }, []);

  const handleSignIn = useCallback(async (authResult, redirectUrl) => {
    const currentUser = authResult.user;

    if (currentUser.isAnonymous) {
      const user = {
        uid: currentUser.uid,
        isAnonymous: true
      };
      dispatch(signIn(user));
      history.push('');
      gtag('event', 'login', {
        method: 'anonymous'
      });
      return;
    }

    dispatch(requestStart());

    const accessToken = await currentUser.getIdToken();
    const credential = authResult.credential;

    const currentProvider = currentUser.providerData.find(data => {
      return data.providerId == credential.providerId;
    });

    const blob = await downloadImage(currentProvider.photoURL);
    const uploadResponse = await uploadToStorage(blob, 'profile');

    const params = {
      uid: currentUser.uid,
      token: accessToken,
      image_url: uploadResponse.imageUrl,
      display_name: currentProvider.displayName
    };

    await initializeApiClient();

    const apiInstance = new UsersApi();
    const newUser = NewUser.constructFromObject(params);

    apiInstance.usersPost(newUser, async (error, data, response) => {
      dispatch(requestFinish());

      if (response.ok) {
        history.push('');
        dispatch(openToast(I18n.t('sign in success')));
        gtag('event', 'login', {
          method: authResult.additionalUserInfo.providerId
        });

        // wait until thumbnail created on cloud function
        await sleep(5000);
        dispatch(signIn(response.body));
      } else {
        dispatch(openToast(response.body.detail));
      }
    });
  });

  return uiConfig && firebaseAuth ? (
    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebaseAuth} />
  ) : null;
};

export default React.memo(LoginButtons);

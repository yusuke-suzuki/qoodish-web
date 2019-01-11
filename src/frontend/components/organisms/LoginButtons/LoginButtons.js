import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import firebaseui from 'firebaseui';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { useIOS } from '../../../utils/detectDevice';

class LoginButtons extends React.PureComponent {
  constructor(props) {
    super(props);

    this.uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          props.signIn(authResult, redirectUrl);
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
    };
  }

  render() {
    return (
      <StyledFirebaseAuth
        uiConfig={this.uiConfig}
        firebaseAuth={firebase.auth()}
      />
    );
  }
}

export default LoginButtons;

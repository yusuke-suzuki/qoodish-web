import React, { Component } from 'react';
import firebase from 'firebase';

const styles = {
  loginContainer: {
    textAlign: 'center',
    marginTop: 104,
    marginBottom: 200
  }
};

export default class Login extends Component {
  componentDidMount() {
    this.renderFirebaseUI();
  }

  componentWillUnmount() {
    window.FirebaseUI.reset();
  }

  renderFirebaseUI() {
    let config = {
      callbacks: {
        signInSuccess: (currentUser, credential, redirectUrl) => {
          this.props.signIn(currentUser, credential, redirectUrl);
        }
      },
      signInSuccessUrl: process.env.ENDPOINT,
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID
      ],
      tosUrl: process.env.ENDPOINT
    };
    window.FirebaseUI.start('#firebaseui-auth-container', config);
  }

  render() {
    return (
      <div>
        <div style={styles.loginContainer}>
          <h1>みんなで作る、冒険の地図。</h1>
          <p>次はどこ行く？</p>
          <div id='firebaseui-auth-container' />
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';
import firebase from 'firebase';
import Typography from 'material-ui/Typography';

const styles = {
  loginContainerLarge: {
    textAlign: 'center',
    paddingTop: 104,
    paddingBottom: 100
  },
  loginContainerSmall: {
    textAlign: 'center',
    paddingTop: 20
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
        <div style={this.props.large ? styles.loginContainerLarge : styles.loginContainerSmall}>
          <Typography type={this.props.large ? 'display4' : 'display3'} gutterBottom>
            みんなで作る、冒険の地図。
          </Typography>
          <Typography type={this.props.large ? 'display2' : 'display1'} gutterBottom>
            次はどこ行く？
          </Typography>
          <div id='firebaseui-auth-container' />
        </div>
      </div>
    );
  }
}

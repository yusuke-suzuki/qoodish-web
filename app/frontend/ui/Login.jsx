import React from 'react';
import firebase from 'firebase';
import Typography from 'material-ui/Typography';
import { FirebaseAuth } from 'react-firebaseui';

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

const uiConfig = {
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

class Login extends React.Component {
  componentWillMount() {
    this.uiConfig = {
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
          <FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
        </div>
      </div>
    );
  }
}

export default Login;

import React from 'react';
import firebase from 'firebase';
import Typography from 'material-ui/Typography';
import { FirebaseAuth } from 'react-firebaseui';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Grid from 'material-ui/Grid';
import Card, { CardContent } from 'material-ui/Card';
import PlaceIcon from 'material-ui-icons/Place';
import ExploreIcon from 'material-ui-icons/Explore';
import { amber } from 'material-ui/colors';

const styles = {
  toolbar: {
    alignSelf: 'center'
  },
  logo: {
    color: 'white'
  },
  loginContainerLarge: {
    textAlign: 'center',
    width: '80%',
    margin: '0 auto',
    padding: 20,
    paddingTop: 104
  },
  loginContainerSmall: {
    textAlign: 'center',
    margin: '0 auto',
    padding: 20,
    paddingTop: 76
  },
  gridContainer: {
    width: '100%',
    margin: 'auto'
  },
  descriptionIcon: {
    width: 150,
    height: 150
  },
  descriptionCard: {
    height: '100%',
    boxShadow: 'initial',
    backgroundColor: 'initial'
  },
  bottomCardContent: {
    backgroundColor: amber[500]
  },
  bottomCardLicense: {
    backgroundColor: amber[500],
    paddingBottom: 16
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
        <AppBar position='fixed'>
          <Toolbar style={styles.toolbar}>
            <Typography type='title' color='inherit' style={styles.logo}>
              Qoodish
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={this.props.large ? styles.loginContainerLarge : styles.loginContainerSmall}>
          <Typography type={this.props.large ? 'display4' : 'display3'} gutterBottom>
            あなたの地図をシェアしよう。
          </Typography>
          <Typography type={this.props.large ? 'display2' : 'display1'} gutterBottom>
            次はどこ行く？
          </Typography>
          <FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
          <Grid container style={styles.gridContainer} spacing={24}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <Card style={styles.descriptionCard}>
                <CardContent>
                  <Typography color='secondary'>
                    <PlaceIcon style={styles.descriptionIcon} />
                  </Typography>
                  <Typography type='display1' gutterBottom>
                    お気に入りの場所をシェアしよう！
                  </Typography>
                  <Typography component='p'>
                    仕事がうまくいったときに訪れるバー、休日を過ごすカフェ、旅行先で見つけた最高のビュースポット。あなただけの "ベストプレイス" を友だちにも教えてあげませんか？
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <Card style={styles.descriptionCard}>
                <CardContent>
                  <Typography color='secondary'>
                    <ExploreIcon style={styles.descriptionIcon} />
                  </Typography>
                  <Typography type='display1' gutterBottom>
                    あなたの "ベストプレイス" を見つけよう！
                  </Typography>
                  <Typography component='p'>
                    代わり映えしない日常にちょっとの刺激をもたらしてくれる場所はどこでしょう？ きっとあなたのよく知る友人たちが知っているはずです！
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
        <Card>
          <CardContent style={styles.bottomCardContent}>
          </CardContent>
          <CardContent style={styles.bottomCardLicense}>
            <Typography type='caption'>
              © 2018 Qoodish, All rights reserved.
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default Login;

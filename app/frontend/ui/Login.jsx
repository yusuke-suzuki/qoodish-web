import React from 'react';
import firebase from 'firebase';
import Typography from 'material-ui/Typography';
import { FirebaseAuth } from 'react-firebaseui';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Grid from 'material-ui/Grid';
import Card, { CardContent, CardMedia } from 'material-ui/Card';
import PlaceIcon from 'material-ui-icons/Place';
import ExploreIcon from 'material-ui-icons/Explore';
import { amber } from 'material-ui/colors';
import ArrowUpwardIcon from 'material-ui-icons/ArrowUpward';
import Button from 'material-ui/Button';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import { Link } from 'react-router-dom';
import I18n from '../containers/I18n';

const styles = {
  toolbar: {
    alignSelf: 'center'
  },
  logo: {
    color: 'white',
    cursor: 'pointer'
  },
  loginContainerLarge: {
    textAlign: 'center',
    width: '80%',
    margin: '0 auto',
    padding: 20
  },
  loginContainerSmall: {
    textAlign: 'center',
    margin: '0 auto',
    padding: 20
  },
  gridContainer: {
    width: '100%',
    margin: 'auto'
  },
  descriptionIcon: {
    width: 150,
    height: 150,
    color: amber[500]
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
    backgroundColor: amber[700],
    paddingBottom: 16
  },
  containerLarge: {
    width: '80%',
    margin: '0 auto'
  },
  containerSmall: {
    width: '100%',
    margin: '0 auto'
  },
  cardMedia: {
    width: '100%'
  },
  firebaseContainer: {
    marginTop: 20
  },
  carouselContainerLarge: {
    textAlign: 'center',
    width: '100%',
    paddingTop: 64,

  },
  carouselContainerSmall: {
    textAlign: 'center',
    width: '100%',
    paddingTop: 56
  },
  carouselTileBar: {
    height: '100%',
    background: 'rgba(0, 0, 0, 0.1)'
  },
  carouselTileBarText: {
    whiteSpace: 'initial'
  },
  scrollTopButton: {
    margin: 20
  }
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

  handleScrollTopClick() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div>
        <AppBar position='fixed'>
          <Toolbar style={styles.toolbar}>
            <Typography type='title' color='inherit' style={styles.logo} onClick={this.handleScrollTopClick}>
              Qoodish
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={this.props.large ? styles.carouselContainerLarge : styles.carouselContainerSmall}>
          <GridList
            cols={1}
            spacing={0}
            cellHeight={500}
          >
            <GridListTile key='carousel'>
              <img src={process.env.LP_CAROUSEL_1} />
              <GridListTileBar
                title={
                  <Typography
                    type='display3'
                    color='inherit'
                    style={styles.carouselTileBarText}
                    gutterBottom
                  >
                    {I18n.t('expand your map')}
                  </Typography>
                }
                subtitle={
                  <div>
                    <Typography
                      type='headline'
                      color='inherit'
                      style={styles.carouselTileBarText}
                    >
                      <span>{I18n.t('where are you going next')}</span>
                    </Typography>
                    <div style={styles.firebaseContainer}>
                      <FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
                    </div>
                  </div>
                }
                style={styles.carouselTileBar}
              />
            </GridListTile>
          </GridList>
        </div>
        <div style={this.props.large ? styles.loginContainerLarge : styles.loginContainerSmall}>
          <Grid container style={styles.gridContainer} spacing={24}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Card style={styles.descriptionCard}>
                <CardContent>
                  <Typography gutterBottom>
                    <PlaceIcon style={styles.descriptionIcon} />
                  </Typography>
                  <Typography type='display1' gutterBottom>
                    お気に入りの場所をシェアしよう！
                  </Typography>
                  <Typography component='p' gutterBottom>
                    仕事がうまくいったときに訪れるバー、休日を過ごすカフェ、旅行先で見つけた最高のビュースポット。
                    あなただけの "ベストプレイス" を友だちにも教えてあげませんか？
                  </Typography>
                </CardContent>
                <CardMedia>
                  <img src={process.env.LP_IMAGE_1} style={styles.cardMedia} />
                </CardMedia>
              </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Card style={styles.descriptionCard}>
                <CardContent>
                  <Typography gutterBottom>
                    <ExploreIcon style={styles.descriptionIcon} />
                  </Typography>
                  <Typography type='display1' gutterBottom>
                    あなたの "ベストプレイス" を見つけよう！
                  </Typography>
                  <Typography component='p' gutterBottom>
                    代わり映えしない日常にちょっとの刺激をもたらしてくれる場所はどこでしょう？
                    きっとあなたのよく知る友人たちが知っているはずです！
                  </Typography>
                </CardContent>
                <CardMedia>
                  <img src={process.env.LP_IMAGE_2} style={styles.cardMedia} />
                </CardMedia>
              </Card>
            </Grid>
          </Grid>
          <Button
            fab
            onClick={this.handleScrollTopClick}
            style={styles.scrollTopButton}
          >
            <ArrowUpwardIcon />
          </Button>
        </div>
        <Card>
          <CardContent style={styles.bottomCardContent}>
            <div style={this.props.large ? styles.containerLarge : styles.containerSmall}>
              <div>
                <Link to='/terms'>利用規約</Link>
              </div>
              <div>
                <Link to='/privacy'>プライバシーポリシー</Link>
              </div>
            </div>
          </CardContent>
          <CardContent style={styles.bottomCardLicense}>
            <div style={this.props.large ? styles.containerLarge : styles.containerSmall}>
              <Typography type='caption'>
                © 2018 Qoodish, All rights reserved.
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default Login;

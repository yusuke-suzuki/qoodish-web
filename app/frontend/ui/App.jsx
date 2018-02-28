import React, { Component } from 'react';
import NavBarContainer from '../containers/NavBarContainer';
import BottomNavContainer from '../containers/BottomNavContainer';
import ToastContainer from '../containers/ToastContainer';
import BlockUiContainer from '../containers/BlockUiContainer';
import IssueDialogContainer from '../containers/IssueDialogContainer';
import LikesDialogContainer from '../containers/LikesDialogContainer';
import CopyReviewDialogContainer from '../containers/CopyReviewDialogContainer';
import { Route, Switch, Redirect } from 'react-router-dom';

import LoginContainer from '../containers/LoginContainer';
import DiscoverContainer from '../containers/DiscoverContainer';
import TimelineContainer from '../containers/TimelineContainer';
import MapsContainer from '../containers/MapsContainer';
import MapDetailContainer from '../containers/MapDetailContainer';
import ReviewDetailContainer from '../containers/ReviewDetailContainer';
import SpotDetailContainer from '../containers/SpotDetailContainer';
import SettingsContainer from '../containers/SettingsContainer';
import TermsContainer from '../containers/TermsContainer';
import PrivacyContainer from '../containers/PrivacyContainer';

import withWidth, { isWidthUp } from 'material-ui/utils/withWidth';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import amber from 'material-ui/colors/amber';
import lightBlue from 'material-ui/colors/lightBlue';
import firebase from 'firebase';
import { LinearProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: amber[300],
      main: amber[500],
      dark: amber[700],
      contrastText: '#fff'
    },
    secondary: {
      light: lightBlue[300],
      main: lightBlue[500],
      dark: lightBlue[700],
      contrastText: '#fff'
    }
  }
});

const styles = {
  progressContainer: {
    top: '50%',
    left: '50%',
    position: 'absolute',
    transform: 'translate(-50%, -50%)'
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      waitForInitialize: true
    };
    this.retryCount = 0;
    this.maxRetryCount = 10;
  }

  componentWillMount() {
    this.props.handleWindowSizeChange(this.props.width);
    this.retryCount = 0;
    if (this.props.authenticated) {
      this.setTimerForInitialize();
    }
  }

  componentWillReceiveProps(props) {
    this.props.handleWindowSizeChange(props.width);
    this.retryCount = 0;
    if (props.authenticated && !props.registrationToken) {
      this.setTimerForInitialize();
    }
  }

  setTimerForInitialize() {
    if (!this.state.waitForInitialize) {
      return;
    }
    const timer = setInterval(() => {
      console.log('Wait for initialize...');
      this.waitForCurrentUser(timer);
      this.retryCount++;
    }, 1000);
  }

  waitForCurrentUser(timer) {
    const currentUser = firebase.auth().currentUser;
    if (currentUser || this.retryCount > this.maxRetryCount) {
      clearInterval(timer);
      this.setState({
        waitForInitialize: false
      });
      this.props.initMessaging();
      this.props.fetchPostableMaps();
      this.props.fetchCurrentPosition();
    }
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }

  render() {
    this.scrollTop();
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <div>
            {this.props.authenticated
              ? this.renderUserOnly()
              : this.renderGuestOnly()}
          </div>
          <ToastContainer />
          <BlockUiContainer />
          <IssueDialogContainer />
          <LikesDialogContainer />
          <CopyReviewDialogContainer />
        </div>
      </MuiThemeProvider>
    );
  }

  renderUserOnly() {
    if (this.state.waitForInitialize) {
      return (
        <div style={styles.progressContainer}>
          <Typography
            type={this.props.large ? 'display3' : 'display2'}
            color="primary"
            gutterBottom
          >
            Qoodish
          </Typography>
          <LinearProgress />
        </div>
      );
    } else {
      return (
        <div>
          <NavBarContainer />
          <Switch>
            <Route exact path="/" component={TimelineContainer} />
            <Route exact path="/discover" component={DiscoverContainer} />
            <Route exact path="/maps" component={MapsContainer} />
            <Route exact path="/maps/:mapId" component={MapDetailContainer} />
            <Route
              exact
              path="/maps/:mapId/reports/:reviewId"
              component={ReviewDetailContainer}
            />
            <Route
              exact
              path="/spots/:placeId"
              component={SpotDetailContainer}
            />
            <Route exact path="/settings" component={SettingsContainer} />
            <Route exact path="/terms" component={TermsContainer} />
            <Route exact path="/privacy" component={PrivacyContainer} />
            <Redirect from="*" to="/" />
          </Switch>
          {!this.props.large && <BottomNavContainer />}
        </div>
      );
    }
  }

  renderGuestOnly() {
    return (
      <div>
        <Switch>
          <Route path="/login" component={LoginContainer} />
          <Route exact path="/terms" component={TermsContainer} />
          <Route exact path="/privacy" component={PrivacyContainer} />
          <Redirect from="*" to="/login" />
        </Switch>
      </div>
    );
  }
}

export default withWidth()(App);

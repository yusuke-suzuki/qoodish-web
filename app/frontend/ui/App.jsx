import React, { Component } from 'react';
import NavBarContainer from '../containers/NavBarContainer';
import ToastContainer from '../containers/ToastContainer';
import BlockUiContainer from '../containers/BlockUiContainer';
import IssueDialogContainer from '../containers/IssueDialogContainer';
import LikesDialogContainer from '../containers/LikesDialogContainer';
import { Route, Switch, Redirect } from 'react-router-dom';

import LoginContainer from '../containers/LoginContainer';
import DiscoverContainer from '../containers/DiscoverContainer';
import TimelineContainer from '../containers/TimelineContainer';
import MapsContainer from '../containers/MapsContainer';
import MapDetailContainer from '../containers/MapDetailContainer';
import SettingsContainer from '../containers/SettingsContainer';
import TermsContainer from '../containers/TermsContainer';
import PrivacyContainer from '../containers/PrivacyContainer';

import withWidth, { isWidthUp } from 'material-ui/utils/withWidth';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import amber from 'material-ui/colors/amber';
import lightBlue from 'material-ui/colors/lightBlue';
import firebase from 'firebase';
import { CircularProgress } from 'material-ui/Progress';

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
  progress: {
    textAlign: 'center',
    marginTop: '50vh'
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
    this.retryCount = 0;
    this.props.handleWindowSizeChange(props.width);
    if (props.authenticated) {
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
    }
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <div>
            {this.props.authenticated ? this.renderUserOnly() : this.renderGuestOnly()}
          </div>
          <ToastContainer />
          <BlockUiContainer />
          <IssueDialogContainer />
          <LikesDialogContainer />
        </div>
      </MuiThemeProvider>
    );
  }

  renderUserOnly() {
    if (this.state.waitForInitialize) {
      return (
        <div style={styles.progress}>
          <CircularProgress />
        </div>
      );
    } else {
      return (
        <div>
          <NavBarContainer />
          <Switch>
            <Route exact path='/' component={TimelineContainer} />
            <Route exact path='/discover' component={DiscoverContainer} />
            <Route exact path='/maps' component={MapsContainer} />
            <Route exact path='/maps/:mapId' component={MapDetailContainer} />
            <Route exact path='/maps/:mapId/reports/:reviewId' component={MapDetailContainer} />
            <Route exact path='/settings' component={SettingsContainer} />
            <Route exact path='/terms' component={TermsContainer} />
            <Route exact path='/privacy' component={PrivacyContainer} />
            <Redirect from='*' to='/' />
          </Switch>
        </div>
      );
    }
  }

  renderGuestOnly() {
    return (
      <div>
        <Switch>
          <Route path='/login' component={LoginContainer} />
          <Route exact path='/terms' component={TermsContainer} />
          <Route exact path='/privacy' component={PrivacyContainer} />
          <Redirect from='*' to='/login' />
        </Switch>
      </div>
    );
  }
}

export default withWidth()(App);

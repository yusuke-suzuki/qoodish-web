import React, { Component } from 'react';
import NavBarContainer from '../containers/NavBarContainer';
import ToastContainer from '../containers/ToastContainer';
import BlockUiContainer from '../containers/BlockUiContainer';
import { Route, Switch, Redirect } from 'react-router-dom';
import LoginContainer from '../containers/LoginContainer';
import DashboardContainer from '../containers/DashboardContainer';
import withWidth, { isWidthUp } from 'material-ui/utils/withWidth';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import createPalette from 'material-ui/styles/palette';
import { amber, lightBlue } from 'material-ui/colors';

const theme = createMuiTheme({
  palette: createPalette({
    primary: amber,
    accent: lightBlue
  })
});

class App extends Component {
  componentWillMount() {
    this.props.handleWindowSizeChange(this.props.width);
  }

  componentWillReceiveProps(props) {
    this.props.handleWindowSizeChange(props.width);
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          {this.props.authenticated ? <NavBarContainer /> : null}
          <div>
            {this.props.authenticated ? this.renderUserOnly() : this.renderGuestOnly()}
          </div>
          <ToastContainer />
          <BlockUiContainer />
        </div>
      </MuiThemeProvider>
    );
  }

  renderUserOnly() {
    return (
      <div>
        <Switch>
          <Route exact path='/' component={DashboardContainer} />
          <Redirect from='*' to='/' />
        </Switch>
      </div>
    );
  }

  renderGuestOnly() {
    return (
      <div>
        <Switch>
          <Route path='/login' component={LoginContainer} />
          <Redirect from='*' to='/login' />
        </Switch>
      </div>
    );
  }
}

export default withWidth()(App);

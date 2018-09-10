import React from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';

import LoginContainer from '../containers/LoginContainer';
import DiscoverContainer from '../containers/DiscoverContainer';
import TimelineContainer from '../containers/TimelineContainer';
import MapsContainer from '../containers/MapsContainer';
import ProfileContainer from '../containers/ProfileContainer';
import UserProfileContainer from '../containers/UserProfileContainer';
import NotificationsContainer from '../containers/NotificationsContainer';
import MapDetailContainer from '../containers/MapDetailContainer';
import ReviewDetailContainer from '../containers/ReviewDetailContainer';
import SpotDetailContainer from '../containers/SpotDetailContainer';
import SettingsContainer from '../containers/SettingsContainer';
import InvitesContainer from '../containers/InvitesContainer';
import TermsContainer from '../containers/TermsContainer';
import PrivacyContainer from '../containers/PrivacyContainer';

export default class Routes extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={TimelineContainer} />
        <Route exact path="/discover" component={DiscoverContainer} />
        <Route exact path="/maps" component={MapsContainer} />
        <Route exact path="/maps/:mapId" component={MapDetailContainer} />
        <Route exact path="/notifications" component={NotificationsContainer} />
        <Route exact path="/profile" component={ProfileContainer} />
        <Route exact path="/users/:userId" component={UserProfileContainer} />
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
        <Route exact path="/invites" component={InvitesContainer} />
        <Route exact path="/terms" component={TermsContainer} />
        <Route exact path="/privacy" component={PrivacyContainer} />
        <Route path="/login" component={LoginContainer} />
        <Redirect from="*" to="/" />
      </Switch>
    );
  }
}

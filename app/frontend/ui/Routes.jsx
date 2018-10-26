import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import loadable from 'loadable-components'

let LoginContainer;
let DiscoverContainer;
let TimelineContainer;
let MapsContainer;
let ProfileContainer;
let UserProfileContainer;
let NotificationsContainer;
let MapDetailContainer;
let ReviewDetailContainer;
let SpotDetailContainer;
let SettingsContainer;
let InvitesContainer;
let TermsContainer;
let PrivacyContainer;

if (process.env.NODE_ENV === 'production') {
  LoginContainer = loadable(() => import(/* webpackChunkName: "login" */'../containers/LoginContainer'));
  DiscoverContainer = loadable(() => import(/* webpackChunkName: "discover" */'../containers/DiscoverContainer'));
  TimelineContainer = loadable(() => import(/* webpackChunkName: "timeline" */'../containers/TimelineContainer'));
  MapsContainer = loadable(() => import(/* webpackChunkName: "maps" */'../containers/MapsContainer'));
  ProfileContainer = loadable(() => import(/* webpackChunkName: "profile" */'../containers/ProfileContainer'));
  UserProfileContainer = loadable(() => import(/* webpackChunkName: "user_profile" */'../containers/UserProfileContainer'));
  NotificationsContainer = loadable(() => import(/* webpackChunkName: "notification" */'../containers/NotificationsContainer'));
  MapDetailContainer = loadable(() => import(/* webpackChunkName: "map_detail" */'../containers/MapDetailContainer'));
  ReviewDetailContainer = loadable(() => import(/* webpackChunkName: "review_detail" */'../containers/ReviewDetailContainer'));
  SpotDetailContainer = loadable(() => import(/* webpackChunkName: "spot_detail" */'../containers/SpotDetailContainer'));
  SettingsContainer = loadable(() => import(/* webpackChunkName: "settings" */'../containers/SettingsContainer'));
  InvitesContainer = loadable(() => import(/* webpackChunkName: "invites" */'../containers/InvitesContainer'));
  TermsContainer = loadable(() => import(/* webpackChunkName: "terms" */'../containers/TermsContainer'));
  PrivacyContainer = loadable(() => import(/* webpackChunkName: "privacy" */'../containers/PrivacyContainer'));
} else {
  LoginContainer = require('../containers/LoginContainer').default;
  DiscoverContainer = require('../containers/DiscoverContainer').default;
  TimelineContainer = require('../containers/TimelineContainer').default;
  MapsContainer = require('../containers/MapsContainer').default;
  ProfileContainer = require('../containers/ProfileContainer').default;
  UserProfileContainer = require('../containers/UserProfileContainer').default;
  NotificationsContainer = require('../containers/NotificationsContainer').default;
  MapDetailContainer = require('../containers/MapDetailContainer').default;
  ReviewDetailContainer = require('../containers/ReviewDetailContainer').default;
  SpotDetailContainer = require('../containers/SpotDetailContainer').default;
  SettingsContainer = require('../containers/SettingsContainer').default;
  InvitesContainer = require('../containers/InvitesContainer').default;
  TermsContainer = require('../containers/TermsContainer').default;
  PrivacyContainer = require('../containers/PrivacyContainer').default;
}

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

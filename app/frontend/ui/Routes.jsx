import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import loadable from 'loadable-components'

const LoginContainer = loadable(() => import(/* webpackChunkName: "login" */'../containers/LoginContainer'));
const DiscoverContainer = loadable(() => import(/* webpackChunkName: "discover" */'../containers/DiscoverContainer'));
const TimelineContainer = loadable(() => import(/* webpackChunkName: "timeline" */'../containers/TimelineContainer'));
const MapsContainer = loadable(() => import(/* webpackChunkName: "maps" */'../containers/MapsContainer'));
const ProfileContainer = loadable(() => import(/* webpackChunkName: "profile" */'../containers/ProfileContainer'));
const UserProfileContainer = loadable(() => import(/* webpackChunkName: "user_profile" */'../containers/UserProfileContainer'));
const NotificationsContainer = loadable(() => import(/* webpackChunkName: "notification" */'../containers/NotificationsContainer'));
const MapDetailContainer = loadable(() => import(/* webpackChunkName: "map_detail" */'../containers/MapDetailContainer'));
const ReviewDetailContainer = loadable(() => import(/* webpackChunkName: "review_detail" */'../containers/ReviewDetailContainer'));
const SpotDetailContainer = loadable(() => import(/* webpackChunkName: "spot_detail" */'../containers/SpotDetailContainer'));
const SettingsContainer = loadable(() => import(/* webpackChunkName: "settings" */'../containers/SettingsContainer'));
const InvitesContainer = loadable(() => import(/* webpackChunkName: "invites" */'../containers/InvitesContainer'));
const TermsContainer = loadable(() => import(/* webpackChunkName: "terms" */'../containers/TermsContainer'));
const PrivacyContainer = loadable(() => import(/* webpackChunkName: "privacy" */'../containers/PrivacyContainer'));

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

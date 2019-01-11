import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import loadable from '@loadable/component';

const LoginContainer = loadable(() =>
  import(/* webpackChunkName: "login" */ './pages/Login')
);
const DiscoverContainer = loadable(() =>
  import(/* webpackChunkName: "discover" */ './pages/Discover')
);
const TimelineContainer = loadable(() =>
  import(/* webpackChunkName: "timeline" */ './pages/Timeline')
);
const ProfileContainer = loadable(() =>
  import(/* webpackChunkName: "profile" */ './pages/Profile')
);
const UserProfileContainer = loadable(() =>
  import(/* webpackChunkName: "user_profile" */ './pages/UserProfile')
);
const NotificationsContainer = loadable(() =>
  import(/* webpackChunkName: "notification" */ './pages/Notifications')
);
const MapDetailContainer = loadable(() =>
  import(/* webpackChunkName: "map_detail" */ './pages/MapDetail')
);
const ReviewDetailContainer = loadable(() =>
  import(/* webpackChunkName: "review_detail" */ './pages/ReviewDetail')
);
const SpotDetailContainer = loadable(() =>
  import(/* webpackChunkName: "spot_detail" */ './pages/SpotDetail')
);
const SettingsContainer = loadable(() =>
  import(/* webpackChunkName: "settings" */ './pages/Settings')
);
const InvitesContainer = loadable(() =>
  import(/* webpackChunkName: "invites" */ './pages/Invites')
);
const TermsContainer = loadable(() =>
  import(/* webpackChunkName: "terms" */ './pages/Terms')
);
const PrivacyContainer = loadable(() =>
  import(/* webpackChunkName: "privacy" */ './pages/Privacy')
);

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={TimelineContainer} />
      <Route exact path="/discover" component={DiscoverContainer} />
      <Route exact path="/maps/:mapId" component={MapDetailContainer} />
      <Route exact path="/notifications" component={NotificationsContainer} />
      <Route exact path="/profile" component={ProfileContainer} />
      <Route exact path="/users/:userId" component={UserProfileContainer} />
      <Route
        exact
        path="/maps/:mapId/reports/:reviewId"
        component={ReviewDetailContainer}
      />
      <Route exact path="/spots/:placeId" component={SpotDetailContainer} />
      <Route exact path="/settings" component={SettingsContainer} />
      <Route exact path="/invites" component={InvitesContainer} />
      <Route exact path="/terms" component={TermsContainer} />
      <Route exact path="/privacy" component={PrivacyContainer} />
      <Route path="/login" component={LoginContainer} />
      <Redirect from="*" to="/" />
    </Switch>
  );
};

export default Routes;

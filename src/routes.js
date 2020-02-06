import React from 'react';

const Login = React.lazy(() =>
  import(/* webpackChunkName: "login" */ './components/pages/Login')
);
const Discover = React.lazy(() =>
  import(/* webpackChunkName: "discover" */ './components/pages/Discover')
);
const Timeline = React.lazy(() =>
  import(/* webpackChunkName: "timeline" */ './components/pages/Timeline')
);
const Profile = React.lazy(() =>
  import(/* webpackChunkName: "profile" */ './components/pages/Profile')
);
const UserProfile = React.lazy(() =>
  import(
    /* webpackChunkName: "user_profile" */ './components/pages/UserProfile'
  )
);
const Notifications = React.lazy(() =>
  import(
    /* webpackChunkName: "notification" */ './components/pages/Notifications'
  )
);
const MapDetail = React.lazy(() =>
  import(/* webpackChunkName: "map_detail" */ './components/pages/MapDetail')
);
const ReviewDetail = React.lazy(() =>
  import(
    /* webpackChunkName: "review_detail" */ './components/pages/ReviewDetail'
  )
);
const SpotDetail = React.lazy(() =>
  import(/* webpackChunkName: "spot_detail" */ './components/pages/SpotDetail')
);
const Settings = React.lazy(() =>
  import(/* webpackChunkName: "settings" */ './components/pages/Settings')
);
const Invites = React.lazy(() =>
  import(/* webpackChunkName: "invites" */ './components/pages/Invites')
);
const Terms = React.lazy(() =>
  import(/* webpackChunkName: "terms" */ './components/pages/Terms')
);
const Privacy = React.lazy(() =>
  import(/* webpackChunkName: "privacy" */ './components/pages/Privacy')
);

const routes = [
  {
    path: '/',
    component: Timeline
  },
  {
    path: '/discover',
    component: Discover
  },
  {
    path: '/maps/:mapId',
    component: MapDetail
  },
  {
    path: '/notifications',
    component: Notifications
  },
  {
    path: '/profile',
    component: Profile
  },
  {
    path: '/users/:userId',
    component: UserProfile
  },
  {
    path: '/maps/:mapId/reports/:reviewId',
    component: ReviewDetail
  },
  {
    path: '/spots/:placeId',
    component: SpotDetail
  },
  {
    path: '/settings',
    component: Settings
  },
  {
    path: '/invites',
    component: Invites
  },
  {
    path: '/terms',
    component: Terms
  },
  {
    path: '/privacy',
    component: Privacy
  },
  {
    path: '/login',
    component: Login
  }
];

export default routes;

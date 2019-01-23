import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'redux-react-hook';
import loadable from '@loadable/component';
import createHistory from 'history/createBrowserHistory';
import pathToRegexp from 'path-to-regexp';

import { OPEN_REVIEW_DIALOG, SWITCH_SUMMARY } from '../actionTypes';

import locationChange from '../actions/locationChange';
import getHistory from '../actions/getHistory';
import openReviewDialog from '../actions/openReviewDialog';
import closeReviewDialog from '../actions/closeReviewDialog';
import selectSpot from '../actions/selectSpot';
import requestMapCenter from '../actions/requestMapCenter';
import switchSummary from '../actions/switchSummary';

const Login = loadable(() =>
  import(/* webpackChunkName: "login" */ './pages/Login')
);
const Discover = loadable(() =>
  import(/* webpackChunkName: "discover" */ './pages/Discover')
);
const Timeline = loadable(() =>
  import(/* webpackChunkName: "timeline" */ './pages/Timeline')
);
const Profile = loadable(() =>
  import(/* webpackChunkName: "profile" */ './pages/Profile')
);
const UserProfile = loadable(() =>
  import(/* webpackChunkName: "user_profile" */ './pages/UserProfile')
);
const Notifications = loadable(() =>
  import(/* webpackChunkName: "notification" */ './pages/Notifications')
);
const MapDetail = loadable(() =>
  import(/* webpackChunkName: "map_detail" */ './pages/MapDetail')
);
const ReviewDetail = loadable(() =>
  import(/* webpackChunkName: "review_detail" */ './pages/ReviewDetail')
);
const SpotDetail = loadable(() =>
  import(/* webpackChunkName: "spot_detail" */ './pages/SpotDetail')
);
const Settings = loadable(() =>
  import(/* webpackChunkName: "settings" */ './pages/Settings')
);
const Invites = loadable(() =>
  import(/* webpackChunkName: "invites" */ './pages/Invites')
);
const Terms = loadable(() =>
  import(/* webpackChunkName: "terms" */ './pages/Terms')
);
const Privacy = loadable(() =>
  import(/* webpackChunkName: "privacy" */ './pages/Privacy')
);

const root = { path: '/', component: Timeline };

const pageRoutes = [
  root,
  { path: '/discover', component: Discover },
  {
    path: '/maps/:mapId',
    component: MapDetail
  },
  {
    path: '/notifications',
    component: Notifications
  },
  { path: '/profile', component: Profile },
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
  { path: '/settings', component: Settings },
  { path: '/invites', component: Invites },
  { path: '/terms', component: Terms },
  { path: '/privacy', component: Privacy },
  { path: '/login', component: Login }
];

const modalRoutes = [
  {
    path: '/maps/:mapId/reports/:reviewId',
    action: OPEN_REVIEW_DIALOG,
    modal: true
  },
  {
    path: '/maps/:mapId',
    action: SWITCH_SUMMARY,
    modal: true
  }
];

const history = createHistory();

const findMatchedRoute = (currentLocation, routes) => {
  let params = {
    primaryId: '',
    secondaryId: ''
  };
  let matched = routes.find(route => {
    const regexp = pathToRegexp(route.path);
    const match = regexp.exec(currentLocation.pathname);
    if (match) {
      params.primaryId = match[1];
      params.secondaryId = match[2];
    }
    return match;
  });
  if (matched) {
    matched.params = params;
  }
  return matched;
};

const Routes = () => {
  const dispatch = useDispatch();
  const [currentLocation, setCurrentLocation] = useState(history.location);
  const [previousRoute, setPreviousRoute] = useState(root);
  const [initialRoute, setInitialRoute] = useState(true);

  const execModalAction = useCallback(route => {
    switch (route.action) {
      case OPEN_REVIEW_DIALOG:
        const review = currentLocation.state.review;
        dispatch(openReviewDialog(review));
        dispatch(selectSpot(review.spot));
        dispatch(requestMapCenter(review.spot.lat, review.spot.lng));
        break;
      case SWITCH_SUMMARY:
        dispatch(switchSummary());
        dispatch(closeReviewDialog());
        break;
      default:
        return;
    }
  });

  useEffect(() => {
    dispatch(getHistory(history));
    dispatch(locationChange(history.location));

    const unlisten = history.listen((location, action) => {
      setCurrentLocation(location);
    });

    return () => {
      unlisten();
    };
  }, []);

  useEffect(
    () => {
      if (currentLocation.state && currentLocation.state.modal) {
        return;
      }
      dispatch(locationChange(currentLocation));
      if (initialRoute) {
        setInitialRoute(false);
      }
    },
    [currentLocation]
  );

  const matchedRoute = useMemo(
    () => {
      if (initialRoute) {
        return findMatchedRoute(currentLocation, pageRoutes);
      } else if (currentLocation.state && currentLocation.state.modal) {
        return findMatchedRoute(currentLocation, modalRoutes);
      } else {
        return findMatchedRoute(currentLocation, pageRoutes);
      }
    },
    [currentLocation]
  );

  useEffect(
    () => {
      if (matchedRoute) {
        if (matchedRoute.modal) {
          execModalAction(matchedRoute);
        } else {
          setPreviousRoute(matchedRoute);
        }
      }
    },
    [matchedRoute]
  );

  if (currentLocation.state && currentLocation.state.modal) {
    return <previousRoute.component params={previousRoute.params} />;
  }

  return matchedRoute ? (
    <matchedRoute.component params={matchedRoute.params} />
  ) : (
    <div>Not Found</div>
  );
};

export default React.memo(Routes);

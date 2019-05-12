import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'redux-react-hook';
import { createBrowserHistory } from 'history';
import pathToRegexp from 'path-to-regexp';

import { OPEN_REVIEW_DIALOG, OPEN_SPOT_DIALOG } from '../actionTypes';

import locationChange from '../actions/locationChange';
import getHistory from '../actions/getHistory';
import openReviewDialog from '../actions/openReviewDialog';
import openSpotDialog from '../actions/openSpotDialog';
import requestMapCenter from '../actions/requestMapCenter';

const Login = React.lazy(() =>
  import(/* webpackChunkName: "login" */ './pages/Login')
);
const Discover = React.lazy(() =>
  import(/* webpackChunkName: "discover" */ './pages/Discover')
);
const Timeline = React.lazy(() =>
  import(/* webpackChunkName: "timeline" */ './pages/Timeline')
);
const Profile = React.lazy(() =>
  import(/* webpackChunkName: "profile" */ './pages/Profile')
);
const UserProfile = React.lazy(() =>
  import(/* webpackChunkName: "user_profile" */ './pages/UserProfile')
);
const Notifications = React.lazy(() =>
  import(/* webpackChunkName: "notification" */ './pages/Notifications')
);
const MapDetail = React.lazy(() =>
  import(/* webpackChunkName: "map_detail" */ './pages/MapDetail')
);
const ReviewDetail = React.lazy(() =>
  import(/* webpackChunkName: "review_detail" */ './pages/ReviewDetail')
);
const SpotDetail = React.lazy(() =>
  import(/* webpackChunkName: "spot_detail" */ './pages/SpotDetail')
);
const Settings = React.lazy(() =>
  import(/* webpackChunkName: "settings" */ './pages/Settings')
);
const Invites = React.lazy(() =>
  import(/* webpackChunkName: "invites" */ './pages/Invites')
);
const Terms = React.lazy(() =>
  import(/* webpackChunkName: "terms" */ './pages/Terms')
);
const Privacy = React.lazy(() =>
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
    path: '/spots/:placeId',
    action: OPEN_SPOT_DIALOG,
    modal: true
  }
];

const history = createBrowserHistory();

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
        dispatch(requestMapCenter(review.spot.lat, review.spot.lng));
        break;
      case OPEN_SPOT_DIALOG:
        const spot = currentLocation.state.spot;
        dispatch(openSpotDialog(spot));
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
      dispatch(locationChange(location));
    });

    return () => {
      unlisten();
    };
  }, []);

  useEffect(() => {
    if (initialRoute) {
      setInitialRoute(false);
    }
  }, [currentLocation]);

  const matchedRoute = useMemo(() => {
    if (initialRoute) {
      return findMatchedRoute(currentLocation, pageRoutes);
    } else if (currentLocation.state && currentLocation.state.modal) {
      return findMatchedRoute(currentLocation, modalRoutes);
    } else {
      return findMatchedRoute(currentLocation, pageRoutes);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (matchedRoute) {
      if (matchedRoute.modal) {
        execModalAction(matchedRoute);
      } else {
        setPreviousRoute(matchedRoute);
      }
    }
  }, [matchedRoute]);

  if (currentLocation.state && currentLocation.state.modal) {
    return (
      <React.Suspense fallback={null}>
        <previousRoute.component params={previousRoute.params} />
      </React.Suspense>
    );
  }

  return matchedRoute ? (
    <React.Suspense fallback={null}>
      <matchedRoute.component params={matchedRoute.params} />
    </React.Suspense>
  ) : (
    <div>Not Found</div>
  );
};

export default React.memo(Routes);

import {
  GET_HISTORY,
  OPEN_TOAST,
  CLOSE_TOAST,
  REQUEST_START,
  REQUEST_FINISH,
  OPEN_ISSUE_DIALOG,
  CLOSE_ISSUE_DIALOG,
  SEARCH_PLACES,
  SEARCH_MAPS,
  OPEN_LIKES_DIALOG,
  CLOSE_LIKES_DIALOG,
  FETCH_LIKES,
  FETCH_NOTIFICATIONS,
  READ_NOTIFICATION,
  OPEN_SIGN_IN_REQUIRED_DIALOG,
  CLOSE_SIGN_IN_REQUIRED_DIALOG,
  OPEN_FEEDBACK_DIALOG,
  CLOSE_FEEDBACK_DIALOG,
  OPEN_DRAWER,
  CLOSE_DRAWER,
  TOGGLE_DRAWER,
  OPEN_SEARCH_MAPS_DIALOG,
  CLOSE_SEARCH_MAPS_DIALOG,
  OPEN_CREATE_ACTIONS,
  CLOSE_CREATE_ACTIONS,
  LOCATION_CHANGE
} from '../actionTypes';
import I18n from '../utils/I18n';

const initialState = {
  history: undefined,
  toastOpen: false,
  toastMessage: '',
  toastDuration: 4000,
  blocking: false,
  pageTitle: '',
  issueDialogOpen: false,
  issueTargetId: null,
  issueTargetType: null,
  pickedPlaces: [],
  likes: [],
  likesDialogOpen: false,
  notifications: [],
  unreadNotifications: [],
  showBackButton: false,
  signInRequiredDialogOpen: false,
  feedbackDialogOpen: false,
  drawerOpen: false,
  bottomNavValue: undefined,
  showSideNav: true,
  showBottomNav: true,
  isMapDetail: false,
  previousLocation: undefined,
  currentLocation: undefined,
  pickedMaps: [],
  searchMapsDialogOpen: false,
  createActionsOpen: false
};

const getBottomNavValue = pathname => {
  switch (pathname) {
    case '/':
      return 0;
    case '/discover':
      return 1;
    case '/profile':
      return 3;
    case '/notifications':
      return 4;
    default:
      return undefined;
  }
};

const switchPageTitle = (pathname, large) => {
  if (pathname === '/') {
    return I18n.t('home');
  } else if (pathname === '/discover') {
    return I18n.t('discover');
  } else if (pathname.includes('/reports')) {
    return I18n.t('report');
  } else if (pathname.includes('/spots')) {
    return I18n.t('spot');
  } else if (pathname.includes('/users') || pathname === '/profile') {
    return I18n.t('account');
  } else if (pathname === '/notifications') {
    return I18n.t('notifications');
  } else if (pathname === '/settings') {
    return I18n.t('settings');
  } else if (pathname === '/invites') {
    return I18n.t('invites');
  } else if (pathname === '/terms') {
    return large ? I18n.t('terms of service') : 'Qoodish';
  } else if (pathname === '/privacy') {
    return large ? I18n.t('privacy policy') : 'Qoodish';
  } else if (pathname === '/login') {
    return I18n.t('login');
  } else {
    return '';
  }
};

const showSideNav = pathname => {
  if (
    (pathname.includes('/maps/') && !pathname.includes('/reports')) ||
    pathname.includes('/login') ||
    pathname.includes('/terms') ||
    pathname.includes('/privacy')
  ) {
    return false;
  } else {
    return true;
  }
};

const showBottomNav = pathname => {
  if (
    pathname.includes('/maps/') ||
    pathname.includes('/spots') ||
    pathname.includes('/login') ||
    pathname.includes('/terms') ||
    pathname.includes('/privacy')
  ) {
    return false;
  } else {
    return true;
  }
};

const detectMapDetail = pathname => {
  return pathname.includes('/maps/') && !pathname.includes('/reports');
};

const switchBackButton = pathname => {
  if (
    pathname.includes('/reports/') ||
    pathname.includes('/maps/') ||
    pathname.includes('/spots/') ||
    pathname.includes('/users/')
  ) {
    return true;
  } else {
    return false;
  }
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_HISTORY:
      return Object.assign({}, state, {
        history: action.payload.history
      });
    case OPEN_TOAST:
      return Object.assign({}, state, {
        toastOpen: true,
        toastMessage: action.payload.message,
        toastDuration: action.payload.duration
      });
    case CLOSE_TOAST:
      return Object.assign({}, state, {
        toastOpen: false,
        toastDuration: initialState.toastDuration
      });
    case REQUEST_START:
      return Object.assign({}, state, {
        blocking: true
      });
    case REQUEST_FINISH:
      return Object.assign({}, state, {
        blocking: false
      });
    case OPEN_ISSUE_DIALOG:
      return Object.assign({}, state, {
        issueDialogOpen: true,
        issueTargetId: action.payload.contentId,
        issueTargetType: action.payload.contentType
      });
    case CLOSE_ISSUE_DIALOG:
      return Object.assign({}, state, {
        issueDialogOpen: false,
        issueTargetId: null,
        issueTargetType: null
      });
    case SEARCH_PLACES:
      return Object.assign({}, state, {
        pickedPlaces: action.payload.places
      });
    case SEARCH_MAPS:
      return Object.assign({}, state, {
        pickedMaps: action.payload.maps
      });
    case OPEN_LIKES_DIALOG:
      return Object.assign({}, state, {
        likesDialogOpen: true
      });
    case CLOSE_LIKES_DIALOG:
      return Object.assign({}, state, {
        likesDialogOpen: false
      });
    case FETCH_LIKES:
      return Object.assign({}, state, {
        likes: action.payload.likes
      });
    case FETCH_NOTIFICATIONS:
      let newNotifications = action.payload.notifications;
      let unreadNotifications = newNotifications.filter(notification => {
        return notification.read === false;
      });
      return Object.assign({}, state, {
        notifications: newNotifications,
        unreadNotifications: unreadNotifications
      });
    case READ_NOTIFICATION:
      if (state.notifications.length === 0) {
        return state;
      } else {
        let index = state.notifications.findIndex(notification => {
          return notification.id === action.payload.notification.id;
        });
        let target = state.notifications[index];
        if (!target) {
          return state;
        }
        return Object.assign({}, state, {
          notifications: [
            ...state.notifications.slice(0, index),
            action.payload.notification,
            ...state.notifications.slice(index + 1)
          ],
          unreadNotifications: []
        });
      }
    case OPEN_SIGN_IN_REQUIRED_DIALOG:
      return Object.assign({}, state, {
        signInRequiredDialogOpen: true
      });
    case CLOSE_SIGN_IN_REQUIRED_DIALOG:
      return Object.assign({}, state, {
        signInRequiredDialogOpen: false
      });
    case OPEN_FEEDBACK_DIALOG:
      return Object.assign({}, state, {
        feedbackDialogOpen: true
      });
    case CLOSE_FEEDBACK_DIALOG:
      return Object.assign({}, state, {
        feedbackDialogOpen: false
      });
    case OPEN_DRAWER:
      return Object.assign({}, state, {
        drawerOpen: true
      });
    case CLOSE_DRAWER:
      return Object.assign({}, state, {
        drawerOpen: false
      });
    case TOGGLE_DRAWER:
      return Object.assign({}, state, {
        drawerOpen: !state.drawerOpen
      });
    case OPEN_SEARCH_MAPS_DIALOG:
      return Object.assign({}, state, {
        searchMapsDialogOpen: true
      });
    case CLOSE_SEARCH_MAPS_DIALOG:
      return Object.assign({}, state, {
        searchMapsDialogOpen: false
      });
    case OPEN_CREATE_ACTIONS:
      return Object.assign({}, state, {
        createActionsOpen: true
      });
    case CLOSE_CREATE_ACTIONS:
      return Object.assign({}, state, {
        createActionsOpen: false
      });
    case LOCATION_CHANGE:
      if (
        state.currentLocation &&
        state.currentLocation.pathname === action.payload.location.pathname
      ) {
        return state;
      }
      let pageTitle =
        action.payload.location.state &&
        action.payload.location.state.modal &&
        state.previousLocation
          ? state.pageTitle
          : switchPageTitle(action.payload.location.pathname, state.large);
      let showBackButton =
        action.payload.location.state &&
        action.payload.location.state.modal &&
        state.previousLocation
          ? state.showBackButton
          : switchBackButton(action.payload.location.pathname);
      return Object.assign({}, state, {
        previousLocation: state.currentLocation,
        currentLocation: action.payload.location,
        pageTitle: pageTitle,
        bottomNavValue: getBottomNavValue(action.payload.location.pathname),
        showBackButton: showBackButton,
        issueDialogOpen: false,
        likesDialogOpen: false,
        signInRequiredDialogOpen: false,
        feedbackDialogOpen: false,
        drawerOpen: false,
        searchMapsDialogOpen: false,
        showSideNav: showSideNav(action.payload.location.pathname),
        showBottomNav: showBottomNav(action.payload.location.pathname),
        isMapDetail: detectMapDetail(action.payload.location.pathname)
      });
    default:
      return state;
  }
};

export default reducer;

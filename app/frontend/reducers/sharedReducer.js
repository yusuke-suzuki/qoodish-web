import {
  OPEN_TOAST,
  CLOSE_TOAST,
  REQUEST_START,
  REQUEST_FINISH,
  UPDATE_WINDOW_SIZE,
  OPEN_ISSUE_DIALOG,
  CLOSE_ISSUE_DIALOG,
  LOAD_PLACES_START,
  LOAD_PLACES_END,
  SEARCH_PLACES,
  LOAD_MAPS_START,
  LOAD_MAPS_END,
  SEARCH_MAPS,
  OPEN_LIKES_DIALOG,
  CLOSE_LIKES_DIALOG,
  FETCH_LIKES,
  FETCH_NOTIFICATIONS,
  READ_NOTIFICATION,
  LOAD_NOTIFICATIONS_START,
  LOAD_NOTIFICATIONS_END,
  OPEN_SIGN_IN_REQUIRED_DIALOG,
  CLOSE_SIGN_IN_REQUIRED_DIALOG,
  OPEN_FEEDBACK_DIALOG,
  CLOSE_FEEDBACK_DIALOG,
  OPEN_DRAWER,
  CLOSE_DRAWER,
  OPEN_SEARCH_MAPS_DIALOG,
  CLOSE_SEARCH_MAPS_DIALOG,
  LOCATION_CHANGE
} from '../actionTypes';
import { isWidthUp } from '@material-ui/core/withWidth';
import I18n from '../containers/I18n';

const initialState = {
  toastOpen: false,
  toastMessage: '',
  blocking: false,
  width: '',
  large: true,
  pageTitle: '',
  issueDialogOpen: false,
  issueTargetId: null,
  issueTargetType: null,
  pickedPlaces: [],
  loadingPlaces: false,
  likes: [],
  likesDialogOpen: false,
  notifications: [],
  unreadNotifications: [],
  loadingNotifications: false,
  showBackButton: false,
  mapsTabActive: false,
  signInRequiredDialogOpen: false,
  feedbackDialogOpen: false,
  drawerOpen: false,
  bottomNavValue: undefined,
  showSideNav: true,
  showBottomNav: true,
  isMapDetail: false,
  previousLocation: undefined,
  currentLocation: undefined,
  loadingMaps: false,
  pickedMaps: [],
  searchMapsDialogOpen: false
};

const getBottomNavValue = (pathname) => {
  switch (pathname) {
    case '/':
      return 0;
    case '/discover':
      return 1;
    case '/maps':
      return 2;
    case '/profile':
      return 3;
    case '/notifications':
      return 4;
    default:
      return undefined;
  }
}

const switchPageTitle = (pathname, large) => {
  if (pathname === '/') {
    return I18n.t('home');
  } else if (pathname === '/discover') {
    return I18n.t('discover');
  } else if (pathname === '/maps') {
    return I18n.t('maps');
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
}

const switchMapsTab = (pathname) => {
  if (pathname.includes('/maps') && !pathname.includes('/maps/')) {
    return true;
  } else {
    return false;
  }
}

const showSideNav = (pathname) => {
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
}

const showBottomNav = (pathname) => {
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
}

const detectMapDetail = (pathname) => {
  return pathname.includes('/maps/') && !pathname.includes('/reports');
}

const switchBackButton = (pathname) => {
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
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_TOAST:
      return Object.assign({}, state, {
        toastOpen: true,
        toastMessage: action.payload.message
      });
    case CLOSE_TOAST:
      return Object.assign({}, state, {
        toastOpen: false
      });
    case REQUEST_START:
      return Object.assign({}, state, {
        blocking: true
      });
    case REQUEST_FINISH:
      return Object.assign({}, state, {
        blocking: false
      });
    case UPDATE_WINDOW_SIZE:
      return Object.assign({}, state, {
        width: action.payload.width,
        large: isWidthUp('md', action.payload.width)
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
    case LOAD_PLACES_START:
      return Object.assign({}, state, {
        loadingPlaces: true
      });
    case LOAD_PLACES_END:
      return Object.assign({}, state, {
        loadingPlaces: false
      });
    case SEARCH_PLACES:
      return Object.assign({}, state, {
        pickedPlaces: action.payload.places
      });
    case LOAD_MAPS_START:
      return Object.assign({}, state, {
        loadingMaps: true
      });
    case LOAD_MAPS_END:
      return Object.assign({}, state, {
        loadingMaps: false
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
    case LOAD_NOTIFICATIONS_START:
      return Object.assign({}, state, {
        loadingNotifications: true
      });
    case LOAD_NOTIFICATIONS_END:
      return Object.assign({}, state, {
        loadingNotifications: false
      });
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
    case OPEN_SEARCH_MAPS_DIALOG:
      return Object.assign({}, state, {
        searchMapsDialogOpen: true
      });
    case CLOSE_SEARCH_MAPS_DIALOG:
      return Object.assign({}, state, {
        searchMapsDialogOpen: false
      });
    case LOCATION_CHANGE:
      return Object.assign({}, state, {
        previousLocation: state.currentLocation ? state.currentLocation : undefined,
        currentLocation: action.payload.location.pathname,
        pageTitle: switchPageTitle(action.payload.location.pathname, state.large),
        bottomNavValue: getBottomNavValue(action.payload.location.pathname),
        showBackButton: switchBackButton(action.payload.location.pathname),
        issueDialogOpen: false,
        likesDialogOpen: false,
        signInRequiredDialogOpen: false,
        feedbackDialogOpen: false,
        drawerOpen: false,
        searchMapsDialogOpen: false,
        showSideNav: showSideNav(action.payload.location.pathname),
        showBottomNav: showBottomNav(action.payload.location.pathname),
        isMapDetail: detectMapDetail(action.payload.location.pathname),
        mapsTabActive: switchMapsTab(action.payload.location.pathname)
      });
    default:
      return state;
  }
};

export default reducer;

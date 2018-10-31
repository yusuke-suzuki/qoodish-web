import {
  OPEN_TOAST,
  CLOSE_TOAST,
  REQUEST_START,
  REQUEST_FINISH,
  UPDATE_WINDOW_SIZE,
  UPDATE_PAGE_TITLE,
  OPEN_ISSUE_DIALOG,
  CLOSE_ISSUE_DIALOG,
  LOAD_PLACES_START,
  LOAD_PLACES_END,
  SEARCH_PLACES,
  OPEN_LIKES_DIALOG,
  CLOSE_LIKES_DIALOG,
  FETCH_REVIEW_LIKES,
  FETCH_NOTIFICATIONS,
  READ_NOTIFICATION,
  LOAD_NOTIFICATIONS_START,
  LOAD_NOTIFICATIONS_END,
  SHOW_MAPS_TAB,
  HIDE_MAPS_TAB,
  OPEN_REQUEST_NOTIFICATION_DIALOG,
  CLOSE_REQUEST_NOTIFICATION_DIALOG,
  OPEN_SIGN_IN_REQUIRED_DIALOG,
  CLOSE_SIGN_IN_REQUIRED_DIALOG,
  OPEN_FEEDBACK_DIALOG,
  CLOSE_FEEDBACK_DIALOG,
  OPEN_DRAWER,
  CLOSE_DRAWER
} from '../actionTypes';
import { isWidthUp } from '@material-ui/core/withWidth';

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
  previous: false,
  requestNotificationDialogOpen: false,
  signInRequiredDialogOpen: false,
  feedbackDialogOpen: false,
  drawerOpen: false,
  bottomNavValue: undefined,
  showSideNav: true,
  isMapDetail: false
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

const showSideNav = (pathname, large) => {
  if (!large) {
    return false;
  } else if (
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
    case UPDATE_PAGE_TITLE:
      return Object.assign({}, state, {
        pageTitle: action.payload.title ? action.payload.title : ''
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
    case OPEN_LIKES_DIALOG:
      return Object.assign({}, state, {
        likesDialogOpen: true
      });
    case CLOSE_LIKES_DIALOG:
      return Object.assign({}, state, {
        likesDialogOpen: false
      });
    case FETCH_REVIEW_LIKES:
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
    case SHOW_MAPS_TAB:
      return Object.assign({}, state, {
        mapsTabActive: true
      });
    case HIDE_MAPS_TAB:
      return Object.assign({}, state, {
        mapsTabActive: false
      });
    case OPEN_REQUEST_NOTIFICATION_DIALOG:
      return Object.assign({}, state, {
        requestNotificationDialogOpen: true
      });
    case CLOSE_REQUEST_NOTIFICATION_DIALOG:
      return Object.assign({}, state, {
        requestNotificationDialogOpen: false
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
    case '@@router/LOCATION_CHANGE':
      return Object.assign({}, state, {
        previous: action.payload.state ? action.payload.state.previous : false,
        bottomNavValue: getBottomNavValue(action.payload.pathname),
        showBackButton: switchBackButton(action.payload.pathname),
        issueDialogOpen: false,
        likesDialogOpen: false,
        requestNotificationDialogOpen: false,
        signInRequiredDialogOpen: false,
        feedbackDialogOpen: false,
        drawerOpen: false,
        showSideNav: showSideNav(action.payload.pathname, state.large),
        isMapDetail: detectMapDetail(action.payload.pathname)
      });
    default:
      return state;
  }
};

export default reducer;

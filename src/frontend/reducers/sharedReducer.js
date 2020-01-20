import {
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
  LOCATION_CHANGE,
  OPEN_ANNOUNCEMENT_DIALOG,
  CLOSE_ANNOUNCEMENT_DIALOG,
  UPDATE_ANNOUNCEMENT_IS_NEW
} from '../actionTypes';

const initialState = {
  toastOpen: false,
  toastMessage: '',
  toastDuration: 4000,
  blocking: false,
  issueDialogOpen: false,
  issueTargetId: null,
  issueTargetType: null,
  pickedPlaces: [],
  likes: [],
  likesDialogOpen: false,
  notifications: [],
  unreadNotifications: [],
  signInRequiredDialogOpen: false,
  feedbackDialogOpen: false,
  drawerOpen: false,
  currentLocation: undefined,
  previousLocation: undefined,
  historyCount: 0,
  pickedMaps: [],
  searchMapsDialogOpen: false,
  createActionsOpen: false,
  announcementDialogOpen: false,
  announcementIsNew: false
};

const isModalLocation = location => {
  return location.state && location.state.modal;
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
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
    case OPEN_ANNOUNCEMENT_DIALOG:
      return Object.assign({}, state, {
        announcementDialogOpen: true
      });
    case CLOSE_ANNOUNCEMENT_DIALOG:
      return Object.assign({}, state, {
        announcementDialogOpen: false
      });
    case UPDATE_ANNOUNCEMENT_IS_NEW:
      return Object.assign({}, state, {
        announcementIsNew: action.payload.isNew
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
      let nextLocation = action.payload.location;

      let historyCount =
        isModalLocation(nextLocation) ||
        (state.currentLocation && isModalLocation(state.currentLocation))
          ? state.historyCount
          : state.historyCount + 1;

      return Object.assign({}, state, {
        currentLocation: nextLocation,
        previousLocation: state.currentLocation,
        historyCount: historyCount,
        issueDialogOpen: false,
        likesDialogOpen: false,
        signInRequiredDialogOpen: false,
        feedbackDialogOpen: false,
        announcementDialogOpen: false,
        drawerOpen: false,
        searchMapsDialogOpen: false
      });
    default:
      return state;
  }
};

export default reducer;

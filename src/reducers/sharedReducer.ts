import {
  OPEN_TOAST,
  CLOSE_TOAST,
  REQUEST_START,
  REQUEST_FINISH,
  OPEN_ISSUE_DIALOG,
  CLOSE_ISSUE_DIALOG,
  SEARCH_MAPS,
  OPEN_LIKES_DIALOG,
  CLOSE_LIKES_DIALOG,
  OPEN_FOLLOWERS_DIALOG,
  CLOSE_FOLLOWERS_DIALOG,
  FETCH_LIKES,
  FETCH_NOTIFICATIONS,
  READ_NOTIFICATION,
  OPEN_SIGN_IN_REQUIRED_DIALOG,
  CLOSE_SIGN_IN_REQUIRED_DIALOG,
  OPEN_DRAWER,
  CLOSE_DRAWER,
  TOGGLE_DRAWER,
  OPEN_SEARCH_MAPS_DIALOG,
  CLOSE_SEARCH_MAPS_DIALOG,
  OPEN_CREATE_ACTIONS,
  CLOSE_CREATE_ACTIONS
} from '../actionTypes';

const initialState = {
  toastOpen: false,
  toastMessage: '',
  toastDuration: 4000,
  blocking: false,
  issueDialogOpen: false,
  issueTargetId: null,
  issueTargetType: null,
  likes: [],
  likesDialogOpen: false,
  followersDialogOpen: false,
  notifications: [],
  unreadNotifications: [],
  signInRequiredDialogOpen: false,
  drawerOpen: false,
  pickedMaps: [],
  searchMapsDialogOpen: false,
  createActionsOpen: false
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
    case OPEN_FOLLOWERS_DIALOG:
      return Object.assign({}, state, {
        followersDialogOpen: true
      });
    case CLOSE_FOLLOWERS_DIALOG:
      return Object.assign({}, state, {
        followersDialogOpen: false
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
    default:
      return state;
  }
};

export default reducer;

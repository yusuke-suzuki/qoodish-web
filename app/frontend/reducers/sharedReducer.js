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
  SHOW_BACK_BUTTON,
  HIDE_BACK_BUTTON,
  SHOW_MAPS_TAB,
  HIDE_MAPS_TAB,
  SHOW_MAP_DETAIL_TAB,
  HIDE_MAP_DETAIL_TAB
} from '../actionTypes';
import { isWidthUp } from 'material-ui/utils/withWidth';

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
  showBackButton: false,
  mapsTabActive: false,
  mapDetailTabActive: false
};

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
    case SHOW_BACK_BUTTON:
      return Object.assign({}, state, {
        showBackButton: true
      });
    case HIDE_BACK_BUTTON:
      return Object.assign({}, state, {
        showBackButton: false
      });
    case SHOW_MAPS_TAB:
      return Object.assign({}, state, {
        mapsTabActive: true
      });
    case HIDE_MAPS_TAB:
      return Object.assign({}, state, {
        mapsTabActive: false
      });
    case SHOW_MAP_DETAIL_TAB:
      return Object.assign({}, state, {
        mapDetailTabActive: true
      });
    case HIDE_MAP_DETAIL_TAB:
      return Object.assign({}, state, {
        mapDetailTabActive: false
      });
    default:
      return state;
  }
};

export default reducer;

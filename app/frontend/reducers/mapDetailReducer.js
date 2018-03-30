import {
  SELECT_MAP,
  OPEN_PLACE_SELECT_DIALOG,
  CLOSE_PLACE_SELECT_DIALOG,
  EDIT_MAP,
  OPEN_JOIN_MAP_DIALOG,
  CLOSE_JOIN_MAP_DIALOG,
  OPEN_LEAVE_MAP_DIALOG,
  CLOSE_LEAVE_MAP_DIALOG,
  JOIN_MAP,
  LEAVE_MAP,
  EDIT_REVIEW,
  DELETE_REVIEW,
  SWITCH_SUMMARY,
  SWITCH_MAP,
  OPEN_INVITE_TARGET_DIALOG,
  CLOSE_INVITE_TARGET_DIALOG,
  FETCH_USERS,
  LOAD_USERS_START,
  LOAD_USERS_END,
  OPEN_REVIEWS_DIALOG,
  CLOSE_REVIEWS_DIALOG,
  CLEAR_MAP_STATE
} from '../actionTypes';

const initialState = {
  currentMap: null,
  placeSelectDialogOpen: false,
  joinMapDialogOpen: false,
  leaveMapDialogOpen: false,
  tabValue: 0,
  inviteTargetDialogOpen: false,
  pickedUsers: [],
  loadingUsers: false,
  spotReviews: [],
  reviewsDialogOpen: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SELECT_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.map
      });
    case OPEN_PLACE_SELECT_DIALOG:
      return Object.assign({}, state, {
        placeSelectDialogOpen: true
      });
    case CLOSE_PLACE_SELECT_DIALOG:
      return Object.assign({}, state, {
        placeSelectDialogOpen: false
      });
    case OPEN_INVITE_TARGET_DIALOG:
      return Object.assign({}, state, {
        inviteTargetDialogOpen: true
      });
    case CLOSE_INVITE_TARGET_DIALOG:
      return Object.assign({}, state, {
        inviteTargetDialogOpen: false
      });
    case LOAD_USERS_START:
      return Object.assign({}, state, {
        loadingUsers: true
      });
    case LOAD_USERS_END:
      return Object.assign({}, state, {
        loadingUsers: false
      });
    case FETCH_USERS:
      return Object.assign({}, state, {
        pickedUsers: action.payload.users
      });
    case EDIT_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.map
      });
    case OPEN_JOIN_MAP_DIALOG:
      return Object.assign({}, state, {
        joinMapDialogOpen: true
      });
    case CLOSE_JOIN_MAP_DIALOG:
      return Object.assign({}, state, {
        joinMapDialogOpen: false
      });
    case OPEN_LEAVE_MAP_DIALOG:
      return Object.assign({}, state, {
        leaveMapDialogOpen: true
      });
    case CLOSE_LEAVE_MAP_DIALOG:
      return Object.assign({}, state, {
        leaveMapDialogOpen: false
      });
    case JOIN_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.currentMap
      });
    case LEAVE_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.currentMap
      });
    case SWITCH_SUMMARY:
      return Object.assign({}, state, {
        tabValue: 0
      });
    case SWITCH_MAP:
      return Object.assign({}, state, {
        tabValue: 1
      });
    case OPEN_REVIEWS_DIALOG:
      return Object.assign({}, state, {
        reviewsDialogOpen: true,
        spotReviews: action.payload.reviews
      });
    case CLOSE_REVIEWS_DIALOG:
      return Object.assign({}, state, {
        reviewsDialogOpen: false,
        spotReviews: []
      });
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        currentMap: null,
        placeSelectDialogOpen: false,
        inviteTargetDialogOpen: false,
        pickedUsers: [],
        joinMapDialogOpen: false,
        leaveMapDialogOpen: false,
        tabValue: 0
      });
    case '@@router/LOCATION_CHANGE':
      return Object.assign({}, state, {
        placeSelectDialogOpen: false,
        inviteTargetDialogOpen: false,
        joinMapDialogOpen: false,
        leaveMapDialogOpen: false,
        reviewsDialogOpen: false
      });
    default:
      return state;
  }
};

export default reducer;

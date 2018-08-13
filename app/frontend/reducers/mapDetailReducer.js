import {
  SELECT_MAP,
  OPEN_PLACE_SELECT_DIALOG,
  CLOSE_PLACE_SELECT_DIALOG,
  EDIT_MAP,
  JOIN_MAP,
  LEAVE_MAP,
  OPEN_LEAVE_MAP_DIALOG,
  CLOSE_LEAVE_MAP_DIALOG,
  SWITCH_SUMMARY,
  SWITCH_MAP,
  OPEN_INVITE_TARGET_DIALOG,
  CLOSE_INVITE_TARGET_DIALOG,
  FETCH_USERS,
  LOAD_USERS_START,
  LOAD_USERS_END,
  CLEAR_MAP_STATE
} from '../actionTypes';

const initialState = {
  currentMap: null,
  placeSelectDialogOpen: false,
  inviteTargetDialogOpen: false,
  pickedUsers: [],
  loadingUsers: false,
  spotReviews: [],
  mapSummaryOpen: false,
  leaveMapDialogOpen: false
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
    case JOIN_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.currentMap
      });
    case LEAVE_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.currentMap,
        leaveMapDialogOpen: false
      });
    case SWITCH_SUMMARY:
      return Object.assign({}, state, {
        mapSummaryOpen: true
      });
    case SWITCH_MAP:
      return Object.assign({}, state, {
        mapSummaryOpen: false
      });
    case OPEN_LEAVE_MAP_DIALOG:
      return Object.assign({}, state, {
        leaveMapDialogOpen: true
      });
    case CLOSE_LEAVE_MAP_DIALOG:
      return Object.assign({}, state, {
        leaveMapDialogOpen: false
      });
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        currentMap: null,
        placeSelectDialogOpen: false,
        inviteTargetDialogOpen: false,
        pickedUsers: [],
        leaveMapDialogOpen: false,
        mapSummaryOpen: false
      });
    case '@@router/LOCATION_CHANGE':
      return Object.assign({}, state, {
        placeSelectDialogOpen: false,
        inviteTargetDialogOpen: false,
        leaveMapDialogOpen: false,
        mapSummaryOpen: false
      });
    default:
      return state;
  }
};

export default reducer;

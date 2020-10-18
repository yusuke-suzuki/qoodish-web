import {
  SELECT_MAP,
  EDIT_MAP,
  JOIN_MAP,
  LEAVE_MAP,
  SWITCH_SUMMARY,
  SWITCH_MAP,
  OPEN_INVITE_TARGET_DIALOG,
  CLOSE_INVITE_TARGET_DIALOG,
  FETCH_USERS,
  CLEAR_MAP_STATE
} from '../actionTypes';

const initialState = {
  currentMap: null,
  inviteTargetDialogOpen: false,
  pickedUsers: [],
  mapSummaryOpen: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SELECT_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.map
      });
    case OPEN_INVITE_TARGET_DIALOG:
      return Object.assign({}, state, {
        inviteTargetDialogOpen: true
      });
    case CLOSE_INVITE_TARGET_DIALOG:
      return Object.assign({}, state, {
        inviteTargetDialogOpen: false
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
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        currentMap: null,
        inviteTargetDialogOpen: false,
        pickedUsers: [],
        mapSummaryOpen: false
      });
    default:
      return state;
  }
};

export default reducer;

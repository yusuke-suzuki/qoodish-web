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
  CREATE_REVIEW,
  EDIT_REVIEW,
  DELETE_REVIEW,
  CLEAR_MAP_STATE
} from '../actionTypes';

const initialState = {
  currentMap: null,
  placeSelectDialogOpen: false,
  joinMapDialogOpen: false,
  leaveMapDialogOpen: false
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
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
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        currentMap: null,
        placeSelectDialogOpen: false,
        joinMapDialogOpen: false,
        leaveMapDialogOpen: false
      });
    default:
      return state;
  }
}

export default reducer;

import {
  DELETE_MAP,
  CREATE_MAP,
  OPEN_CREATE_MAP_DIALOG,
  CLOSE_CREATE_MAP_DIALOG,
  OPEN_EDIT_MAP_DIALOG,
  CLOSE_EDIT_MAP_DIALOG,
  OPEN_DELETE_MAP_DIALOG,
  CLOSE_DELETE_MAP_DIALOG,
  FETCH_POSTABLE_MAPS,
  LEAVE_MAP,
  OPEN_LEAVE_MAP_DIALOG,
  CLOSE_LEAVE_MAP_DIALOG
} from '../actionTypes';

const initialState = {
  targetMap: null,
  postableMaps: [],
  createMapDialogOpen: false,
  editMapDialogOpen: false,
  deleteMapDialogOpen: false,
  leaveMapDialogOpen: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_POSTABLE_MAPS:
      return Object.assign({}, state, {
        postableMaps: action.payload.maps
      });
    case CREATE_MAP:
      return Object.assign({}, state, {
        postableMaps: [...state.postableMaps, action.payload.newMap]
      });
    case OPEN_CREATE_MAP_DIALOG:
      return Object.assign({}, state, {
        createMapDialogOpen: true
      });
    case CLOSE_CREATE_MAP_DIALOG:
      return Object.assign({}, state, {
        createMapDialogOpen: false
      });
    case DELETE_MAP:
      let rejected = state.postableMaps.filter(map => {
        return map.id != action.payload.id;
      });
      return Object.assign({}, state, {
        postableMaps: rejected
      });
    case OPEN_EDIT_MAP_DIALOG:
      return Object.assign({}, state, {
        targetMap: action.payload.map,
        editMapDialogOpen: true
      });
    case CLOSE_EDIT_MAP_DIALOG:
      return Object.assign({}, state, {
        targetMap: null,
        editMapDialogOpen: false
      });
    case OPEN_DELETE_MAP_DIALOG:
      return Object.assign({}, state, {
        targetMap: action.payload.map,
        deleteMapDialogOpen: true
      });
    case CLOSE_DELETE_MAP_DIALOG:
      return Object.assign({}, state, {
        targetMap: null,
        deleteMapDialogOpen: false
      });
    case LEAVE_MAP:
      return Object.assign({}, state, {
        leaveMapDialogOpen: false
      });
    case OPEN_LEAVE_MAP_DIALOG:
      return Object.assign({}, state, {
        leaveMapDialogOpen: true,
        targetMap: action.payload.map
      });
    case CLOSE_LEAVE_MAP_DIALOG:
      return Object.assign({}, state, {
        leaveMapDialogOpen: false,
        targetMap: undefined
      });
    default:
      return state;
  }
};

export default reducer;

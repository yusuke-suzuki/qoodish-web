import {
  EDIT_MAP,
  DELETE_MAP,
  FETCH_MY_MAPS,
  FETCH_FOLLOWING_MAPS,
  CREATE_MAP,
  OPEN_CREATE_MAP_DIALOG,
  CLOSE_CREATE_MAP_DIALOG,
  OPEN_EDIT_MAP_DIALOG,
  CLOSE_EDIT_MAP_DIALOG,
  OPEN_DELETE_MAP_DIALOG,
  CLOSE_DELETE_MAP_DIALOG,
  LOAD_MY_MAPS_START,
  LOAD_MY_MAPS_END,
  LOAD_FOLLOWING_MAPS_START,
  LOAD_FOLLOWING_MAPS_END
} from '../actionTypes';

const initialState = {
  targetMap: null,
  loadingMyMaps: false,
  loadingFollowingMaps: false,
  myMaps: [],
  followingMaps: [],
  createMapDialogOpen: false,
  editMapDialogOpen: false,
  deleteMapDialogOpen: false
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case LOAD_MY_MAPS_START:
      return Object.assign({}, state, {
        loadingMyMaps: true
      });
    case LOAD_MY_MAPS_END:
      return Object.assign({}, state, {
        loadingMyMaps: false
      });
    case LOAD_FOLLOWING_MAPS_START:
      return Object.assign({}, state, {
        loadingFollowingMaps: true
      });
    case LOAD_FOLLOWING_MAPS_END:
      return Object.assign({}, state, {
        loadingFollowingMaps: false
      });
    case FETCH_MY_MAPS:
      return Object.assign({}, state, {
        myMaps: action.payload.maps
      });
    case FETCH_FOLLOWING_MAPS:
      return Object.assign({}, state, {
        followingMaps: action.payload.maps
      });
    case CREATE_MAP:
      return Object.assign({}, state, {
        myMaps: [...state.myMaps, action.payload.newMap]
      });
    case OPEN_CREATE_MAP_DIALOG:
      return Object.assign({}, state, {
        createMapDialogOpen: true
      });
    case CLOSE_CREATE_MAP_DIALOG:
      return Object.assign({}, state, {
        createMapDialogOpen: false
      });
    case EDIT_MAP:
      let index = state.myMaps.findIndex((map) => { return map.id == action.payload.map.id; });
      if (index == -1) {
        return state;
      }
      let targetMap = state.myMaps[index];
      Object.assign(targetMap, action.payload.map);

      return Object.assign({}, state, {
        myMaps: [
          ...state.myMaps.slice(0, index),
          targetMap,
          ...state.myMaps.slice(index + 1)
        ]
      });
    case DELETE_MAP:
      let rejected = state.myMaps.filter((map) => { return map.id != action.payload.id; });
      return Object.assign({}, state, {
        myMaps: rejected
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
    default:
      return state;
  }
}

export default reducer;

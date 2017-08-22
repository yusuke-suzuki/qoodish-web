import {
  FETCH_MAPS,
  FETCH_POPULAR_MAPS,
  CREATE_MAP,
  LOAD_MAPS_START,
  LOAD_MAPS_END,
  LOAD_POPULAR_MAPS_START,
  LOAD_POPULAR_MAPS_END,
  OPEN_CREATE_MAP_DIALOG,
  CLOSE_CREATE_MAP_DIALOG,
  EDIT_MAP,
  DELETE_MAP
} from '../actionTypes';

const initialState = {
  currentMaps: [],
  popularMaps: [],
  loadingMaps: false,
  loadingPopularMaps: false,
  createMapDialogOpen: false
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case LOAD_MAPS_START:
      return Object.assign({}, state, {
        loadingMaps: true
      });
    case LOAD_MAPS_END:
      return Object.assign({}, state, {
        loadingMaps: false
      });
    case FETCH_MAPS:
      return Object.assign({}, state, {
        currentMaps: action.payload.maps
      });
    case LOAD_POPULAR_MAPS_START:
      return Object.assign({}, state, {
        loadingPopularMaps: true
      });
    case LOAD_POPULAR_MAPS_END:
      return Object.assign({}, state, {
        loadingPopularMaps: false
      });
    case FETCH_POPULAR_MAPS:
      return Object.assign({}, state, {
        popularMaps: action.payload.maps
      });
    case CREATE_MAP:
      return Object.assign({}, state, {
        currentMaps: [...state.currentMaps, action.payload.newMap]
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
      let index = state.currentMaps.findIndex((map) => { return map.id == action.payload.map.id; });
      if (index == -1) {
        return state;
      }
      let currentMap = state.currentMaps[index];
      Object.assign(currentMap, action.payload.map);

      return Object.assign({}, state, {
        currentMaps: [
          ...state.currentMaps.slice(0, index),
          currentMap,
          ...state.currentMaps.slice(index + 1)
        ]
      });
    case DELETE_MAP:
      let rejected = state.currentMaps.filter((map) => { return map.id != action.payload.id; });
      return Object.assign({}, state, {
        currentMaps: rejected
      });
    default:
      return state;
  }
}

export default reducer;

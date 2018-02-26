import {
  GET_CURRENT_POSITION,
  GET_MAP_BASE_POSITION,
  REQUEST_CURRENT_POSITION,
  REQUEST_MAP_BASE,
  REQUEST_MAP_CENTER,
  FETCH_SPOTS,
  REQUEST_ROUTE,
  CLEAR_MAP_STATE,
  G_MAP_MOUNTED,
  MAP_ZOOM_CHANGED,
  MAP_CENTER_CHANGED
} from '../actionTypes';

const initialState = {
  gMap: null,
  defaultCenter: {
    lat: 35.710063,
    lng: 139.8107
  },
  defaultZoom: 17,
  currentPosition: {},
  mapBasePosition: {
    lat: 35.710063,
    lng: 139.8107
  },
  center: {
    lat: 35.710063,
    lng: 139.8107
  },
  zoom: 17,
  spots: [],
  directions: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CURRENT_POSITION:
      return Object.assign({}, state, {
        currentPosition: {
          lat: parseFloat(action.payload.lat),
          lng: parseFloat(action.payload.lng)
        }
      });
    case GET_MAP_BASE_POSITION:
      return Object.assign({}, state, {
        mapBasePosition: {
          lat: parseFloat(action.payload.lat),
          lng: parseFloat(action.payload.lng)
        }
      });
    case REQUEST_CURRENT_POSITION:
      if (!state.currentPosition.lat) {
        return state;
      }
      return Object.assign({}, state, {
        center: {
          lat: state.currentPosition.lat,
          lng: state.currentPosition.lng
        },
        zoom: 17
      });
    case REQUEST_MAP_BASE:
      return Object.assign({}, state, {
        center: {
          lat: state.mapBasePosition.lat,
          lng: state.mapBasePosition.lng
        },
        zoom: 17
      });
    case REQUEST_MAP_CENTER:
      return Object.assign({}, state, {
        center: {
          lat: parseFloat(action.payload.position.lat),
          lng: parseFloat(action.payload.position.lng)
        },
        zoom: 17
      });
    case FETCH_SPOTS:
      return Object.assign({}, state, {
        spots: action.payload.spots
      });
    case REQUEST_ROUTE:
      return Object.assign({}, state, {
        directions: action.payload.directions
      });
    case G_MAP_MOUNTED:
      return Object.assign({}, state, {
        gMap: action.payload.map
      });
    case MAP_ZOOM_CHANGED:
      return Object.assign({}, state, {
        zoom: action.payload.zoom
      });
    case MAP_CENTER_CHANGED:
      return Object.assign({}, state, {
        center: action.payload.center
      });
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        gMap: null,
        zoom: 17,
        spots: [],
        directions: []
      });
    default:
      return state;
  }
};

export default reducer;

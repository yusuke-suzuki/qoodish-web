import {
  GET_CURRENT_POSITION,
  REQUEST_CURRENT_POSITION,
  REQUEST_MAP_CENTER,
  FETCH_SPOTS,
  CLEAR_MAP_STATE
} from '../actionTypes';

const initialState = {
  currentPosition: {},
  center: {
    lat: 35.710063,
    lng: 139.8107
  },
  zoom: 17,
  spots: []
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
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        zoom: 17,
        spots: []
      });
    default:
      return state;
  }
};

export default reducer;

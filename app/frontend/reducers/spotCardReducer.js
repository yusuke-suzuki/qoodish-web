import {
  SELECT_SPOT,
  OPEN_SPOT_CARD,
  CLOSE_SPOT_CARD,
  CLEAR_MAP_STATE
} from '../actionTypes';

const initialState = {
  spotCardOpen: false,
  currentSpot: {},
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case SELECT_SPOT:
      return Object.assign({}, state, {
        currentSpot: action.payload.spot
      });
    case OPEN_SPOT_CARD:
      return Object.assign({}, state, {
        spotCardOpen: true
      });
    case CLOSE_SPOT_CARD:
      return Object.assign({}, state, {
        spotCardOpen: false
      });
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        spotCardOpen: false,
        currentSpot: {}
      });
    default:
      return state;
  }
}

export default reducer;

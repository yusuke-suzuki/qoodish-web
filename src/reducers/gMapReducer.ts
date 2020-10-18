import { FETCH_SPOTS, CLEAR_MAP_STATE } from '../actionTypes';

const initialState = {
  spots: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SPOTS:
      return Object.assign({}, state, {
        spots: action.payload.spots
      });
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        spots: []
      });
    default:
      return state;
  }
};

export default reducer;

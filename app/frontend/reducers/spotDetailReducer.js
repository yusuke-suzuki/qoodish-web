import {
  LOAD_SPOT_START,
  LOAD_SPOT_END,
  FETCH_SPOT,
  FETCH_SPOT_REVIEWS,
  CLEAR_SPOT_STATE
} from '../actionTypes';

const initialState = {
  spotLoading: false,
  currentSpot: undefined,
  spotReviews: []
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case LOAD_SPOT_START:
      return Object.assign({}, state, {
        spotLoading: true
      });
    case LOAD_SPOT_END:
      return Object.assign({}, state, {
        spotLoading: false
      });
    case FETCH_SPOT:
      return Object.assign({}, state, {
        currentSpot: action.payload.spot
      });
    case FETCH_SPOT_REVIEWS:
      return Object.assign({}, state, {
        spotReviews: action.payload.reviews
      });
    case CLEAR_SPOT_STATE:
      return Object.assign({}, state, {
        spotLoading: false,
        currentSpot: undefined,
        spotReviews: []
      });
    default:
      return state;
  }
}

export default reducer;

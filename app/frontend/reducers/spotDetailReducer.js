import {
  TOGGLE_RIGHT_DRAWER,
  SELECT_SPOT,
  OPEN_SPOT_DETAIL,
  CLOSE_SPOT_DETAIL,
  FETCH_SPOT_REVIEWS,
  EDIT_REVIEW,
  DELETE_REVIEW,
  CLEAR_MAP_STATE
} from '../actionTypes';

const initialState = {
  spotDetailOpen: false,
  currentSpot: null,
  spotReviews: []
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case TOGGLE_RIGHT_DRAWER:
      return Object.assign({}, state, {
        spotDetailOpen: !state.spotDetailOpen
      });
    case SELECT_SPOT:
      return Object.assign({}, state, {
        currentSpot: action.payload.spot
      });
    case OPEN_SPOT_DETAIL:
      return Object.assign({}, state, {
        spotDetailOpen: true
      });
    case CLOSE_SPOT_DETAIL:
      return Object.assign({}, state, {
        spotDetailOpen: false
      });
    case FETCH_SPOT_REVIEWS:
      return Object.assign({}, state, {
        spotReviews: action.payload.reviews
      });
    case EDIT_REVIEW:
      if (state.spotReviews.length === 0) {
        return state;
      }

      let index = state.spotReviews.findIndex((review) => { return review.id == action.payload.review.id; });
      let currentReview = state.spotReviews[index];
      if (!currentReview) {
        return state;
      }

      Object.assign(currentReview, action.payload.review);

      return Object.assign({}, state, {
        spotReviews: [
          ...state.spotReviews.slice(0, index),
          currentReview,
          ...state.spotReviews.slice(index + 1)
        ]
      });
    case DELETE_REVIEW:
      if (state.spotReviews.length === 0) {
        return state;
      }

      let sporReviews = state.spotReviews.filter((review) => { return review.id != action.payload.id; });
      return Object.assign({}, state, {
        spotReviews: sporReviews
      });
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        spotDetailOpen: false,
        currentSpot: null,
        spotReviews: []
      });
    default:
      return state;
  }
}

export default reducer;

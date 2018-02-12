import {
  LOAD_SPOT_START,
  LOAD_SPOT_END,
  FETCH_SPOT,
  FETCH_SPOT_REVIEWS,
  EDIT_REVIEW,
  DELETE_REVIEW,
  LIKE_REVIEW,
  UNLIKE_REVIEW,
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
    case LIKE_REVIEW:
    case UNLIKE_REVIEW:
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

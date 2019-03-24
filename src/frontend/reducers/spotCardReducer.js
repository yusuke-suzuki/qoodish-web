import {
  SELECT_SPOT,
  OPEN_SPOT_CARD,
  CLOSE_SPOT_CARD,
  CLEAR_MAP_STATE,
  CLEAR_SPOT_STATE,
  FETCH_MAP_SPOT_REVIEWS,
  CREATE_REVIEW,
  EDIT_REVIEW,
  DELETE_REVIEW
} from '../actionTypes';

const initialState = {
  spotCardOpen: false,
  currentSpot: undefined,
  spotReviews: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
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
    case FETCH_MAP_SPOT_REVIEWS:
      return Object.assign({}, state, {
        spotReviews: [...action.payload.reviews]
      });
    case CREATE_REVIEW:
      if (
        state.spotReviews < 1 ||
        state.spotReviews[0].map.id !== action.payload.review.map.id ||
        state.spotReviews[0].place_id !== action.payload.review.place_id
      ) {
        return state;
      }

      return Object.assign({}, state, {
        spotReviews: [action.payload.review, ...state.spotReviews]
      });
    case EDIT_REVIEW:
      if (state.spotReviews.length < 1) {
        return state;
      }

      let index = state.spotReviews.findIndex(review => {
        return review.id == action.payload.review.id;
      });
      let currentReview = state.spotReviews[index];

      if (!currentReview) {
        return state;
      }

      return Object.assign({}, state, {
        spotReviews: [
          ...state.spotReviews.slice(0, index),
          Object.assign(currentReview, action.payload.review),
          ...state.spotReviews.slice(index + 1)
        ]
      });
    case DELETE_REVIEW:
      if (state.spotReviews.length < 1) {
        return state;
      }

      return Object.assign({}, state, {
        spotReviews: state.spotReviews.filter(review => {
          return review.id !== action.payload.id;
        })
      });
    case CLEAR_MAP_STATE:
    case CLEAR_SPOT_STATE:
      return Object.assign({}, state, {
        spotCardOpen: false,
        currentSpot: undefined,
        spotReviews: []
      });
    default:
      return state;
  }
};

export default reducer;

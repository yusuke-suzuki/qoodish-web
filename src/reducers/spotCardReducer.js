import {
  SELECT_MAP_SPOT,
  FETCH_MAP_SPOT_REVIEWS,
  OPEN_SPOT_CARD,
  CLOSE_SPOT_CARD,
  CLEAR_MAP_STATE,
  CLEAR_MAP_SPOT_STATE,
  CREATE_REVIEW,
  EDIT_REVIEW,
  DELETE_REVIEW
} from '../actionTypes';

const initialState = {
  spotCardOpen: false,
  currentSpot: {},
  spotReviews: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SELECT_MAP_SPOT:
      return Object.assign({}, state, {
        currentSpot: action.payload.spot
      });
    case FETCH_MAP_SPOT_REVIEWS:
      return Object.assign({}, state, {
        spotReviews: action.payload.reviews
      });
    case OPEN_SPOT_CARD:
      return Object.assign({}, state, {
        spotCardOpen: true
      });
    case CLOSE_SPOT_CARD:
      return Object.assign({}, state, {
        spotCardOpen: false
      });
    case CREATE_REVIEW:
      if (
        state.spotReviews < 1 ||
        state.spotReviews[0].map.id !== action.payload.review.map.id ||
        state.spotReviews[0].place_id !== action.payload.review.spot.place_id
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
          action.payload.review,
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
    case CLEAR_MAP_SPOT_STATE:
      return Object.assign({}, state, {
        spotCardOpen: false,
        currentSpot: {},
        spotReviews: []
      });
    default:
      return state;
  }
};

export default reducer;

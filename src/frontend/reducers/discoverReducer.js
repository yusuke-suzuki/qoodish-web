import {
  FETCH_ACTIVE_MAPS,
  FETCH_RECENT_MAPS,
  FETCH_POPULAR_MAPS,
  FETCH_RECENT_REVIEWS,
  EDIT_REVIEW,
  DELETE_REVIEW
} from '../actionTypes';

const initialState = {
  recentReviews: [],
  activeMaps: [],
  recentMaps: [],
  popularMaps: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ACTIVE_MAPS:
      return Object.assign({}, state, {
        activeMaps: action.payload.maps
      });
    case FETCH_RECENT_MAPS:
      return Object.assign({}, state, {
        recentMaps: action.payload.maps
      });
    case FETCH_POPULAR_MAPS:
      return Object.assign({}, state, {
        popularMaps: action.payload.maps
      });
    case FETCH_RECENT_REVIEWS:
      return Object.assign({}, state, {
        recentReviews: action.payload.reviews
      });
    case EDIT_REVIEW:
      if (state.recentReviews.length < 1) {
        return state;
      }

      let index = state.recentReviews.findIndex(review => {
        return review.id == action.payload.review.id;
      });
      let currentReview = state.recentReviews[index];

      if (!currentReview) {
        return state;
      }

      return Object.assign({}, state, {
        recentReviews: [
          ...state.recentReviews.slice(0, index),
          action.payload.review,
          ...state.recentReviews.slice(index + 1)
        ]
      });
    case DELETE_REVIEW:
      if (state.recentReviews.length < 1) {
        return state;
      }

      return Object.assign({}, state, {
        recentReviews: state.recentReviews.filter(review => {
          return review.id !== action.payload.id;
        })
      });
    default:
      return state;
  }
};

export default reducer;

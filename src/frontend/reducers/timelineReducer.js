import {
  FETCH_REVIEWS,
  FETCH_MORE_REVIEWS,
  CREATE_REVIEW,
  EDIT_REVIEW,
  DELETE_REVIEW,
  LOCATION_CHANGE
} from '../actionTypes';

const initialState = {
  currentReviews: [],
  reviewDialogOpen: false,
  noMoreReviews: false,
  nextTimestamp: ''
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_REVIEWS:
      return Object.assign({}, state, {
        currentReviews: action.payload.reviews,
        noMoreReviews: action.payload.reviews.length < 1,
        nextTimestamp:
          action.payload.reviews.length > 0
            ? action.payload.reviews[action.payload.reviews.length - 1]
                .created_at
            : ''
      });
    case FETCH_MORE_REVIEWS:
      return Object.assign({}, state, {
        currentReviews:
          action.payload.reviews.length > 0
            ? [...state.currentReviews, ...action.payload.reviews]
            : state.currentReviews,
        noMoreReviews: action.payload.reviews.length < 1,
        nextTimestamp:
          action.payload.reviews.length > 0
            ? action.payload.reviews[action.payload.reviews.length - 1]
                .created_at
            : ''
      });
    case CREATE_REVIEW:
      return Object.assign({}, state, {
        currentReviews: [action.payload.review, ...state.currentReviews]
      });
    case EDIT_REVIEW:
      if (state.currentReviews.length < 1) {
        return state;
      }

      let index = state.currentReviews.findIndex(review => {
        return review.id === action.payload.review.id;
      });
      let currentReview = state.currentReviews[index];

      if (!currentReview) {
        return state;
      }

      return Object.assign({}, state, {
        currentReviews: [
          ...state.currentReviews.slice(0, index),
          Object.assign(currentReview, action.payload.review),
          ...state.currentReviews.slice(index + 1)
        ]
      });
    case DELETE_REVIEW:
      if (state.currentReviews.length < 1) {
        return state;
      }
      return Object.assign({}, state, {
        currentReviews: state.currentReviews.filter(review => {
          return review.id !== action.payload.id;
        })
      });
    case LOCATION_CHANGE:
      return Object.assign({}, state, {
        currentReviews: [],
        noMoreReviews: false,
        nextTimestamp: ''
      });
    default:
      return state;
  }
};

export default reducer;

import {
  LOAD_MY_REVIEWS_START,
  LOAD_MY_REVIEWS_END,
  LOAD_MORE_MY_REVIEWS_START,
  LOAD_MORE_MY_REVIEWS_END,
  FETCH_MY_REVIEWS,
  FETCH_MORE_MY_REVIEWS,
  CREATE_REVIEW,
  EDIT_REVIEW,
  DELETE_REVIEW,
  LIKE_REVIEW,
  UNLIKE_REVIEW,
  CLEAR_PROFILE_STATE
} from '../actionTypes';

const initialState = {
  currentReviews: [],
  loadingReviews: false,
  loadingMoreReviews: false,
  noMoreReviews: false,
  nextTimestamp: ''
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_MY_REVIEWS_START:
      return Object.assign({}, state, {
        loadingReviews: true
      });
    case LOAD_MY_REVIEWS_END:
      return Object.assign({}, state, {
        loadingReviews: false
      });
    case LOAD_MORE_MY_REVIEWS_START:
      return Object.assign({}, state, {
        loadingMoreReviews: true
      });
    case LOAD_MORE_MY_REVIEWS_END:
      return Object.assign({}, state, {
        loadingMoreReviews: false
      });
    case FETCH_MY_REVIEWS:
      return Object.assign({}, state, {
        currentReviews: action.payload.reviews,
        noMoreReviews: !(action.payload.reviews.length > 0),
        nextTimestamp:
          action.payload.reviews.length > 0
            ? action.payload.reviews[action.payload.reviews.length - 1]
                .created_at
            : ''
      });
    case FETCH_MORE_MY_REVIEWS:
      return Object.assign({}, state, {
        currentReviews:
          action.payload.reviews.length > 0
            ? [...state.currentReviews, ...action.payload.reviews]
            : state.currentReviews,
        noMoreReviews: !(action.payload.reviews.length > 0),
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
    case LIKE_REVIEW:
    case UNLIKE_REVIEW:
    case EDIT_REVIEW:
      let index = state.currentReviews.findIndex(review => {
        return review.id == action.payload.review.id;
      });
      let currentReview = state.currentReviews[index];
      if (!currentReview) {
        return state;
      }
      return Object.assign({}, state, {
        currentReviews: [
          ...state.currentReviews.slice(0, index),
          action.payload.review,
          ...state.currentReviews.slice(index + 1)
        ]
      });
    case DELETE_REVIEW:
      if (state.currentReviews.length == 0) {
        return state;
      }
      let rejected = state.currentReviews.filter(review => {
        return review.id != action.payload.id;
      });
      return Object.assign({}, state, {
        currentReviews: rejected
      });
    case CLEAR_PROFILE_STATE:
      return Object.assign({}, state, initialState);
    default:
      return state;
  }
};

export default reducer;

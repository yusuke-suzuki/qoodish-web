import {
  LOAD_REVIEW_START,
  LOAD_REVIEW_END,
  SELECT_REVIEW,
  EDIT_REVIEW,
  DELETE_REVIEW,
  LIKE_REVIEW,
  UNLIKE_REVIEW,
  CLEAR_REVIEW_STATE
} from '../actionTypes';

const initialState = {
  reviewLoading: false,
  currentReview: undefined
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case LOAD_REVIEW_START:
      return Object.assign({}, state, {
        reviewLoading: true
      });
    case LOAD_REVIEW_END:
      return Object.assign({}, state, {
        reviewLoading: false
      });
    case SELECT_REVIEW:
      return Object.assign({}, state, {
        currentReview: action.payload.review
      });
    case LIKE_REVIEW:
    case UNLIKE_REVIEW:
    case EDIT_REVIEW:
      if (!state.currentReview) {
        return state;
      }
      return Object.assign({}, state, {
        currentReview: action.payload.review
      });
    case DELETE_REVIEW:
      if (!state.currentReview) {
        return state;
      }
      return Object.assign({}, state, {
        currentReview: undefined
      });
    case CLEAR_REVIEW_STATE:
      return Object.assign({}, state, {
        reviewLoading: false,
        currentReview: undefined
      });
    default:
      return state;
  }
}

export default reducer;

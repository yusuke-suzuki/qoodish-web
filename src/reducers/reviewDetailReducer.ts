import { FETCH_REVIEW, EDIT_REVIEW, DELETE_REVIEW } from '../actionTypes';

const initialState = {
  currentReview: undefined
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_REVIEW:
      return Object.assign({}, state, {
        currentReview: action.payload.review
      });
    case EDIT_REVIEW:
      if (
        !state.currentReview ||
        state.currentReview.id !== action.payload.review.id
      ) {
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
    default:
      return state;
  }
};

export default reducer;

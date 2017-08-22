import {
  LOAD_REVIEWS_START,
  LOAD_REVIEWS_END,
  FETCH_REVIEWS,
  FETCH_MORE_REVIEWS,
  CREATE_REVIEW,
  EDIT_REVIEW,
  DELETE_REVIEW,
  OPEN_EDIT_REVIEW_DIALOG,
  CLOSE_EDIT_REVIEW_DIALOG,
  OPEN_DELETE_REVIEW_DIALOG,
  CLOSE_DELETE_REVIEW_DIALOG,
  OPEN_REVIEW_DIALOG,
  CLOSE_REVIEW_DIALOG,
  CLEAR_MAP_STATE
} from '../actionTypes';

const initialState = {
  currentReview: null,
  reviewDialogOpen: false
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case EDIT_REVIEW:
      return Object.assign({}, state, {
        currentReview: action.payload.review
      });
    case OPEN_EDIT_REVIEW_DIALOG:
      return Object.assign({}, state, {
        currentReview: action.payload.review
      });
    case OPEN_DELETE_REVIEW_DIALOG:
      return Object.assign({}, state, {
        currentReview: action.payload.review
      });
    case OPEN_REVIEW_DIALOG:
      return Object.assign({}, state, {
        reviewDialogOpen: true,
        currentReview: action.payload.review
      });
    case CLOSE_REVIEW_DIALOG:
      return Object.assign({}, state, {
        reviewDialogOpen: false,
        currentReview: null
      });
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        currentReview: null
      });
    default:
      return state;
  }
}

export default reducer;

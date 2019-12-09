import {
  EDIT_REVIEW,
  DELETE_REVIEW,
  OPEN_EDIT_REVIEW_DIALOG,
  CLOSE_EDIT_REVIEW_DIALOG,
  OPEN_COPY_REVIEW_DIALOG,
  CLOSE_COPY_REVIEW_DIALOG,
  OPEN_DELETE_REVIEW_DIALOG,
  CLOSE_DELETE_REVIEW_DIALOG,
  SELECT_PLACE_FOR_REVIEW,
  OPEN_DELETE_COMMENT_DIALOG,
  CLOSE_DELETE_COMMENT_DIALOG,
  OPEN_REVIEW_DIALOG,
  CLOSE_REVIEW_DIALOG,
  LOCATION_CHANGE
} from '../actionTypes';

const initialState = {
  currentReview: undefined,
  targetReview: undefined,
  editReviewDialogOpen: false,
  copyReviewDialogOpen: false,
  deleteReviewDialogOpen: false,
  selectedPlace: undefined,
  deleteCommentDialogOpen: false,
  targetComment: undefined,
  reviewDialogOpen: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SELECT_PLACE_FOR_REVIEW:
      return Object.assign({}, state, {
        selectedPlace: action.payload.place,
        editReviewDialogOpen: true
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
      return Object.assign({}, state, {
        currentReview: undefined
      });
    case OPEN_EDIT_REVIEW_DIALOG:
      return Object.assign({}, state, {
        targetReview: action.payload.review,
        editReviewDialogOpen: true,
        selectedPlace: {
          placeId: action.payload.review.place_id,
          description: action.payload.review.spot.name
        }
      });
    case CLOSE_EDIT_REVIEW_DIALOG:
      return Object.assign({}, state, {
        targetReview: null,
        editReviewDialogOpen: false,
        selectedPlace: undefined
      });
    case OPEN_COPY_REVIEW_DIALOG:
      return Object.assign({}, state, {
        targetReview: action.payload.review,
        copyReviewDialogOpen: true
      });
    case CLOSE_COPY_REVIEW_DIALOG:
      return Object.assign({}, state, {
        targetReview: null,
        copyReviewDialogOpen: false
      });
    case OPEN_DELETE_REVIEW_DIALOG:
      return Object.assign({}, state, {
        targetReview: action.payload.review,
        deleteReviewDialogOpen: true
      });
    case CLOSE_DELETE_REVIEW_DIALOG:
      return Object.assign({}, state, {
        targetReview: null,
        deleteReviewDialogOpen: false
      });
    case OPEN_DELETE_COMMENT_DIALOG:
      return Object.assign({}, state, {
        targetComment: action.payload.comment,
        deleteCommentDialogOpen: true
      });
    case CLOSE_DELETE_COMMENT_DIALOG:
      return Object.assign({}, state, {
        targetComment: undefined,
        deleteCommentDialogOpen: false
      });
    case OPEN_REVIEW_DIALOG:
      return Object.assign({}, state, {
        reviewDialogOpen: true
      });
    case CLOSE_REVIEW_DIALOG:
      return Object.assign({}, state, {
        reviewDialogOpen: false
      });
    case LOCATION_CHANGE:
      return Object.assign({}, state, {
        reviewDialogOpen: false,
        editReviewDialogOpen: false,
        copyReviewDialogOpen: false,
        deleteReviewDialogOpen: false,
        deleteCommentDialogOpen: false
      });
    default:
      return state;
  }
};

export default reducer;

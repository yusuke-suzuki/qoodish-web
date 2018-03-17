import {
  LOAD_REVIEWS_START,
  LOAD_REVIEWS_END,
  LOAD_MORE_REVIEWS_START,
  LOAD_MORE_REVIEWS_END,
  FETCH_REVIEWS,
  FETCH_MORE_REVIEWS,
  CREATE_REVIEW,
  EDIT_REVIEW,
  DELETE_REVIEW,
  OPEN_EDIT_REVIEW_DIALOG,
  CLOSE_EDIT_REVIEW_DIALOG,
  OPEN_COPY_REVIEW_DIALOG,
  CLOSE_COPY_REVIEW_DIALOG,
  OPEN_DELETE_REVIEW_DIALOG,
  CLOSE_DELETE_REVIEW_DIALOG,
  OPEN_REVIEW_DIALOG,
  CLOSE_REVIEW_DIALOG,
  SELECT_PLACE_FOR_REVIEW,
  LIKE_REVIEW,
  UNLIKE_REVIEW,
  CLEAR_MAP_STATE
} from '../actionTypes';

const initialState = {
  currentReview: null,
  targetReview: null,
  currentReviews: [],
  reviewDialogOpen: false,
  loadingReviews: false,
  loadingMoreReviews: false,
  noMoreReviews: false,
  nextTimestamp: '',
  editReviewDialogOpen: false,
  copyReviewDialogOpen: false,
  deleteReviewDialogOpen: false,
  selectedPlace: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REVIEWS_START:
      return Object.assign({}, state, {
        loadingReviews: true
      });
    case LOAD_REVIEWS_END:
      return Object.assign({}, state, {
        loadingReviews: false
      });
    case LOAD_MORE_REVIEWS_START:
      return Object.assign({}, state, {
        loadingMoreReviews: true
      });
    case LOAD_MORE_REVIEWS_END:
      return Object.assign({}, state, {
        loadingMoreReviews: false
      });
    case FETCH_REVIEWS:
      return Object.assign({}, state, {
        currentReviews: action.payload.reviews,
        noMoreReviews: !(action.payload.reviews.length > 0),
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
        noMoreReviews: !(action.payload.reviews.length > 0),
        nextTimestamp:
          action.payload.reviews.length > 0
            ? action.payload.reviews[action.payload.reviews.length - 1]
                .created_at
            : ''
      });
    case SELECT_PLACE_FOR_REVIEW:
      return Object.assign({}, state, {
        selectedPlace: action.payload.place,
        editReviewDialogOpen: true
      });
    case CREATE_REVIEW:
      return Object.assign({}, state, {
        currentReviews: [action.payload.review, ...state.currentReviews]
      });
    case LIKE_REVIEW:
    case UNLIKE_REVIEW:
    case EDIT_REVIEW:
      if (state.currentReviews.length === 0) {
        return Object.assign({}, state, {
          currentReview: action.payload.review
        });
      } else {
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
      }
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
    case OPEN_EDIT_REVIEW_DIALOG:
      return Object.assign({}, state, {
        targetReview: action.payload.review,
        editReviewDialogOpen: true
      });
    case CLOSE_EDIT_REVIEW_DIALOG:
      return Object.assign({}, state, {
        targetReview: null,
        editReviewDialogOpen: false,
        selectedPlace: null
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
    case OPEN_REVIEW_DIALOG:
      return Object.assign({}, state, {
        reviewDialogOpen: true,
        currentReview: action.payload.review
      });
    case CLOSE_REVIEW_DIALOG:
      return Object.assign({}, state, {
        reviewDialogOpen: false
      });
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        currentReviews: [],
        loadingReviews: false,
        noMoreReviews: false,
        nextTimestamp: '',
        targetReview: null,
        currentReview: null,
        reviewDialogOpen: false,
        editReviewDialogOpen: false,
        copyReviewDialogOpen: false,
        deleteReviewDialogOpen: false
      });
    case '@@router/LOCATION_CHANGE':
      return Object.assign({}, state, {
        reviewDialogOpen: false,
        editReviewDialogOpen: false,
        copyReviewDialogOpen: false,
        deleteReviewDialogOpen: false
      });
    default:
      return state;
  }
};

export default reducer;

import {
  LOAD_REVIEWS_START,
  LOAD_REVIEWS_END,
  LOAD_MORE_REVIEWS_START,
  LOAD_MORE_REVIEWS_END,
  FETCH_REVIEWS,
  FETCH_MORE_REVIEWS,
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
  currentReviews: [],
  reviewDialogOpen: false,
  loadingReviews: false,
  loadingMoreReviews: false,
  noMoreReviews: false,
  nextTimestamp: ''
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
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
        nextTimestamp: (action.payload.reviews.length > 0) ? action.payload.reviews[action.payload.reviews.length - 1].created_at : ''
      });
    case FETCH_MORE_REVIEWS:
      return Object.assign({}, state, {
        currentReviews: (action.payload.reviews.length > 0) ? [...state.currentReviews, ...action.payload.reviews] : state.currentReviews,
        noMoreReviews: !(action.payload.reviews.length > 0),
        nextTimestamp: (action.payload.reviews.length > 0) ? action.payload.reviews[action.payload.reviews.length - 1].created_at : ''
      });
    case EDIT_REVIEW:
      if (state.currentReviews.length == 0) {
        Object.assign(state.currentReview, action.payload.review);
        return Object.assign({}, state, {
          currentReview: state.currentReview
        });
      } else {
        let index = state.currentReviews.findIndex((review) => { return review.id == action.payload.review.id; });
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

      let rejected = state.currentReviews.filter((review) => { return review.id != action.payload.id; });
      return Object.assign({}, state, {
        currentReviews: rejected
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
        currentReviews: [],
        loadingReviews: false,
        noMoreReviews: false,
        nextTimestamp: '',
        currentReview: null,
        reviewDialogOpen: false
      });
    default:
      return state;
  }
}

export default reducer;

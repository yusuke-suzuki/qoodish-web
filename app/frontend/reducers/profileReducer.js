import {
  LOAD_USER_MAPS_START,
  LOAD_USER_MAPS_END,
  FETCH_USER_MAPS,
  LOAD_USER_REVIEWS_START,
  LOAD_USER_REVIEWS_END,
  LOAD_MORE_USER_REVIEWS_START,
  LOAD_MORE_USER_REVIEWS_END,
  FETCH_USER_REVIEWS,
  FETCH_MORE_USER_REVIEWS,
  EDIT_REVIEW,
  DELETE_REVIEW,
  FETCH_USER_PROFILE,
  CLEAR_PROFILE_STATE,
  OPEN_EDIT_PROFILE_DIALOG,
  CLOSE_EDIT_PROFILE_DIALOG,
  LOCATION_CHANGE
} from '../actionTypes';

const initialState = {
  currentUser: {},
  currentMaps: [],
  loadingMaps: false,
  currentReviews: [],
  loadingReviews: false,
  loadingMoreReviews: false,
  noMoreReviews: false,
  nextTimestamp: '',
  editProfileDialogOpen: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USER_PROFILE:
      return Object.assign({}, state, {
        currentUser: action.payload.user
      });
    case LOAD_USER_MAPS_START:
      return Object.assign({}, state, {
        loadingMaps: true
      });
    case LOAD_USER_MAPS_END:
      return Object.assign({}, state, {
        loadingMaps: false
      });
    case FETCH_USER_MAPS:
      return Object.assign({}, state, {
        currentMaps: action.payload.maps
      });
    case LOAD_USER_REVIEWS_START:
      return Object.assign({}, state, {
        loadingReviews: true
      });
    case LOAD_USER_REVIEWS_END:
      return Object.assign({}, state, {
        loadingReviews: false
      });
    case LOAD_MORE_USER_REVIEWS_START:
      return Object.assign({}, state, {
        loadingMoreReviews: true
      });
    case LOAD_MORE_USER_REVIEWS_END:
      return Object.assign({}, state, {
        loadingMoreReviews: false
      });
    case FETCH_USER_REVIEWS:
      return Object.assign({}, state, {
        currentReviews: action.payload.reviews,
        noMoreReviews: !(action.payload.reviews.length > 0),
        nextTimestamp:
          action.payload.reviews.length > 0
            ? action.payload.reviews[action.payload.reviews.length - 1]
                .created_at
            : ''
      });
    case FETCH_MORE_USER_REVIEWS:
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
    case OPEN_EDIT_PROFILE_DIALOG:
      return Object.assign({}, state, {
        editProfileDialogOpen: true
      });
    case CLOSE_EDIT_PROFILE_DIALOG:
      return Object.assign({}, state, {
        editProfileDialogOpen: false
      });
    case CLEAR_PROFILE_STATE:
      return Object.assign({}, state, initialState);
    case LOCATION_CHANGE:
      return Object.assign({}, state, {
        editProfileDialogOpen: false
      });
    default:
      return state;
  }
};

export default reducer;

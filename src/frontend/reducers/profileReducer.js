import {
  FETCH_MY_MAPS,
  FETCH_FOLLOWING_MAPS,
  FETCH_USER_REVIEWS,
  FETCH_MORE_USER_REVIEWS,
  EDIT_REVIEW,
  DELETE_REVIEW,
  FETCH_USER_PROFILE,
  FETCH_MY_PROFILE,
  CLEAR_PROFILE_STATE,
  OPEN_EDIT_PROFILE_DIALOG,
  CLOSE_EDIT_PROFILE_DIALOG,
  OPEN_FOLLOWING_MAPS_DIALOG,
  CLOSE_FOLLOWING_MAPS_DIALOG,
  LEAVE_MAP,
  LOCATION_CHANGE
} from '../actionTypes';

const initialState = {
  currentUser: {},
  myMaps: [],
  followingMaps: [],
  currentReviews: [],
  noMoreReviews: false,
  nextTimestamp: '',
  editProfileDialogOpen: false,
  followingMapsDialogOpen: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USER_PROFILE:
      return Object.assign({}, state, {
        currentUser: action.payload.user
      });
    case FETCH_MY_PROFILE:
      if (action.payload.user.id !== state.currentUser.id) {
        return state;
      }
      return Object.assign({}, state, {
        currentUser: action.payload.user
      });
    case LEAVE_MAP:
      return Object.assign({}, state, {
        followingMaps: state.followingMaps.filter(map => {
          return map.id != action.payload.currentMap.id;
        })
      });
    case FETCH_MY_MAPS:
      return Object.assign({}, state, {
        myMaps: action.payload.maps
      });
    case FETCH_FOLLOWING_MAPS:
      return Object.assign({}, state, {
        followingMaps: action.payload.maps
      });
    case OPEN_FOLLOWING_MAPS_DIALOG:
      return Object.assign({}, state, {
        followingMapsDialogOpen: true
      });
    case CLOSE_FOLLOWING_MAPS_DIALOG:
      return Object.assign({}, state, {
        followingMapsDialogOpen: false
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

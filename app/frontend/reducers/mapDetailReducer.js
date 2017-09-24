import {
  SELECT_MAP,
  OPEN_PLACE_SELECT_DIALOG,
  CLOSE_PLACE_SELECT_DIALOG,
  EDIT_MAP,
  TOGGLE_RIGHT_DRAWER,
  OPEN_SPOT_DETAIL,
  CLOSE_SPOT_DETAIL,
  OPEN_MAP_SUMMARY,
  CLOSE_MAP_SUMMARY,
  FETCH_SPOT_REVIEWS,
  FETCH_COLLABORATORS,
  OPEN_JOIN_MAP_DIALOG,
  CLOSE_JOIN_MAP_DIALOG,
  OPEN_LEAVE_MAP_DIALOG,
  CLOSE_LEAVE_MAP_DIALOG,
  JOIN_MAP,
  LEAVE_MAP,
  EDIT_REVIEW,
  DELETE_REVIEW,
  CLEAR_MAP_STATE
} from '../actionTypes';

const initialState = {
  currentMap: null,
  placeSelectDialogOpen: false,
  mapSummaryOpen: false,
  spotDetailOpen: false,
  currentSpot: null,
  spotReviews: [],
  collaborators: [],
  joinMapDialogOpen: false,
  leaveMapDialogOpen: false
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case SELECT_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.map
      });
    case OPEN_PLACE_SELECT_DIALOG:
      return Object.assign({}, state, {
        placeSelectDialogOpen: true
      });
    case CLOSE_PLACE_SELECT_DIALOG:
      return Object.assign({}, state, {
        placeSelectDialogOpen: false
      });
    case EDIT_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.map
      });
    case TOGGLE_RIGHT_DRAWER:
      return Object.assign({}, state, {
        spotDetailOpen: !state.spotDetailOpen
      });
    case OPEN_SPOT_DETAIL:
      return Object.assign({}, state, {
        spotDetailOpen: true,
        currentSpot: action.payload.spot
      });
    case CLOSE_SPOT_DETAIL:
      return Object.assign({}, state, {
        spotDetailOpen: false
      });
    case OPEN_MAP_SUMMARY:
      return Object.assign({}, state, {
        mapSummaryOpen: true
      });
    case CLOSE_MAP_SUMMARY:
      return Object.assign({}, state, {
        mapSummaryOpen: false
      });
    case FETCH_SPOT_REVIEWS:
      return Object.assign({}, state, {
        spotReviews: action.payload.reviews
      });
    case FETCH_COLLABORATORS:
      return Object.assign({}, state, {
        collaborators: action.payload.collaborators
      });
    case OPEN_JOIN_MAP_DIALOG:
      return Object.assign({}, state, {
        joinMapDialogOpen: true
      });
    case CLOSE_JOIN_MAP_DIALOG:
      return Object.assign({}, state, {
        joinMapDialogOpen: false
      });
    case OPEN_LEAVE_MAP_DIALOG:
      return Object.assign({}, state, {
        leaveMapDialogOpen: true
      });
    case CLOSE_LEAVE_MAP_DIALOG:
      return Object.assign({}, state, {
        leaveMapDialogOpen: false
      });
    case JOIN_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.currentMap
      });
    case LEAVE_MAP:
      return Object.assign({}, state, {
        currentMap: action.payload.currentMap
      });
    case EDIT_REVIEW:
      if (state.spotReviews.length == 0) {
        return state;
      }

      let index = state.spotReviews.findIndex((review) => { return review.id == action.payload.review.id; });
      let currentReview = state.spotReviews[index];
      if (!currentReview) {
        return state;
      }

      Object.assign(currentReview, action.payload.review);

      return Object.assign({}, state, {
        spotReviews: [
          ...state.spotReviews.slice(0, index),
          currentReview,
          ...state.spotReviews.slice(index + 1)
        ]
      });
    case DELETE_REVIEW:
      if (state.spotReviews.length == 0) {
        return state;
      }

      let rejected = state.spotReviews.filter((review) => { return review.id != action.payload.id; });
      return Object.assign({}, state, {
        spotReviews: rejected,
      });
    case CLEAR_MAP_STATE:
      return Object.assign({}, state, {
        currentMap: null,
        placeSelectDialogOpen: false,
        selectedPlace: null,
        mapSummaryOpen: false,
        spotDetailOpen: false,
        currentSpot: null,
        spotReviews: [],
        collaborators: [],
        joinMapDialogOpen: false,
        leaveMapDialogOpen: false
      });
    default:
      return state;
  }
}

export default reducer;

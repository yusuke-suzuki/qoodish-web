import {
  FETCH_POPULAR_MAPS,
  LOAD_POPULAR_MAPS_START,
  LOAD_POPULAR_MAPS_END,
  FETCH_RECENT_REVIEWS,
  LOAD_RECENT_REVIEWS_START,
  LOAD_RECENT_REVIEWS_END,
  PICK_UP_MAP
} from '../actionTypes';

const initialState = {
  mapPickedUp: null,
  recentReviews: [],
  popularMaps: [],
  loadingPopularMaps: false,
  loadingRecentReviews: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_POPULAR_MAPS_START:
      return Object.assign({}, state, {
        loadingPopularMaps: true
      });
    case LOAD_POPULAR_MAPS_END:
      return Object.assign({}, state, {
        loadingPopularMaps: false
      });
    case FETCH_POPULAR_MAPS:
      return Object.assign({}, state, {
        popularMaps: action.payload.maps
      });
    case LOAD_RECENT_REVIEWS_START:
      return Object.assign({}, state, {
        loadingRecentReviews: true
      });
    case LOAD_RECENT_REVIEWS_END:
      return Object.assign({}, state, {
        loadingRecentReviews: false
      });
    case FETCH_RECENT_REVIEWS:
      return Object.assign({}, state, {
        recentReviews: action.payload.reviews
      });
    case PICK_UP_MAP:
      return Object.assign({}, state, {
        mapPickedUp: action.payload.map
      });
    default:
      return state;
  }
};

export default reducer;

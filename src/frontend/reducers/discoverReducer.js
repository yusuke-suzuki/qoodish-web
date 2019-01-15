import {
  FETCH_ACTIVE_MAPS,
  FETCH_RECENT_MAPS,
  FETCH_POPULAR_MAPS,
  FETCH_RECENT_REVIEWS
} from '../actionTypes';

const initialState = {
  recentReviews: [],
  activeMaps: [],
  recentMaps: [],
  popularMaps: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ACTIVE_MAPS:
      return Object.assign({}, state, {
        activeMaps: action.payload.maps
      });
    case FETCH_RECENT_MAPS:
      return Object.assign({}, state, {
        recentMaps: action.payload.maps
      });
    case FETCH_POPULAR_MAPS:
      return Object.assign({}, state, {
        popularMaps: action.payload.maps
      });
    case FETCH_RECENT_REVIEWS:
      return Object.assign({}, state, {
        recentReviews: action.payload.reviews
      });
    default:
      return state;
  }
};

export default reducer;

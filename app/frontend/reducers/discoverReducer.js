import {
  FETCH_ACTIVE_MAPS,
  LOAD_ACTIVE_MAPS_START,
  LOAD_ACTIVE_MAPS_END,
  FETCH_RECENT_MAPS,
  LOAD_RECENT_MAPS_START,
  LOAD_RECENT_MAPS_END,
  FETCH_POPULAR_MAPS,
  LOAD_POPULAR_MAPS_START,
  LOAD_POPULAR_MAPS_END,
  FETCH_RECENT_REVIEWS,
  LOAD_RECENT_REVIEWS_START,
  LOAD_RECENT_REVIEWS_END,
  PICK_UP_MAP,
  FETCH_TRENDING_SPOTS,
  LOAD_TRENDING_SPOTS_START,
  LOAD_TRENDING_SPOTS_END,
} from '../actionTypes';

const initialState = {
  mapPickedUp: null,
  recentReviews: [],
  activeMaps: [],
  recentMaps: [],
  popularMaps: [],
  trendingSpots: [],
  loadingActiveMaps: false,
  loadingRecentMaps: false,
  loadingPopularMaps: false,
  loadingRecentReviews: false,
  loadingTrendingSpots: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ACTIVE_MAPS_START:
      return Object.assign({}, state, {
        loadingActiveMaps: true
      });
    case LOAD_ACTIVE_MAPS_END:
      return Object.assign({}, state, {
        loadingActiveMaps: false
      });
    case FETCH_ACTIVE_MAPS:
      return Object.assign({}, state, {
        activeMaps: action.payload.maps
      });
    case LOAD_RECENT_MAPS_START:
      return Object.assign({}, state, {
        loadingRecentMaps: true
      });
    case LOAD_RECENT_MAPS_END:
      return Object.assign({}, state, {
        loadingRecentMaps: false
      });
    case FETCH_RECENT_MAPS:
      return Object.assign({}, state, {
        recentMaps: action.payload.maps
      });
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
    case LOAD_TRENDING_SPOTS_START:
      return Object.assign({}, state, {
        loadingTrendingSpots: true
      });
    case LOAD_TRENDING_SPOTS_END:
      return Object.assign({}, state, {
        loadingTrendingSpots: false
      });
    case FETCH_TRENDING_SPOTS:
      return Object.assign({}, state, {
        trendingSpots: action.payload.spots
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

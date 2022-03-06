import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';

import appReducer from './reducers/appReducer';
import sharedReducer from './reducers/sharedReducer';
import timelineReducer from './reducers/timelineReducer';
import discoverReducer from './reducers/discoverReducer';
import mapsReducer from './reducers/mapsReducer';
import mapDetailReducer from './reducers/mapDetailReducer';
import spotCardReducer from './reducers/spotCardReducer';
import spotDetailReducer from './reducers/spotDetailReducer';
import reviewDetailReducer from './reducers/reviewDetailReducer';
import mapSummaryReducer from './reducers/mapSummaryReducer';
import reviewsReducer from './reducers/reviewsReducer';
import gMapReducer from './reducers/gMapReducer';
import settingsReducer from './reducers/settingsReducer';
import profileReducer from './reducers/profileReducer';

const middlewares = [];

if (process.env.NODE_ENV !== 'production') {
  const logger = createLogger();
  middlewares.push(logger);
}

const reducer = combineReducers({
  app: appReducer,
  shared: sharedReducer,
  timeline: timelineReducer,
  discover: discoverReducer,
  maps: mapsReducer,
  mapDetail: mapDetailReducer,
  spotCard: spotCardReducer,
  spotDetail: spotDetailReducer,
  reviewDetail: reviewDetailReducer,
  mapSummary: mapSummaryReducer,
  reviews: reviewsReducer,
  gMap: gMapReducer,
  settings: settingsReducer,
  profile: profileReducer
});

export default () => {
  const store = compose(applyMiddleware(...middlewares))(createStore)(reducer);
  return { store };
};

import React from 'react';
import { render } from 'react-dom';

import App from './components/App';

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { StoreContext } from 'redux-react-hook';
import { createLogger } from 'redux-logger';

import detectCurrentLocale from './utils/detectCurrentLocale';
import initializeFirebaseApp from './utils/initializeFirebaseApp';

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
import metadataReducer from './reducers/metadataReducer';

detectCurrentLocale();
initializeFirebaseApp();

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
  profile: profileReducer,
  metadata: metadataReducer
});

const store = compose(applyMiddleware(...middlewares))(createStore)(reducer);

window.addEventListener('DOMContentLoaded', () => {
  render(
    <StoreContext.Provider value={store}>
      <App />
    </StoreContext.Provider>,
    document.querySelector('#render-target')
  );
});

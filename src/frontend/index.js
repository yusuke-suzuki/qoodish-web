import React from 'react';
import { render } from 'react-dom';

import App from './components/App';

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { StoreContext } from 'redux-react-hook';

import appReducer from './reducers/appReducer';
import sharedReducer from './reducers/sharedReducer';
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

import persistState from 'redux-localstorage';

import { createLogger } from 'redux-logger';
import initializeFirebaseApp from './utils/initializeFirebaseApp';

initializeFirebaseApp();

const middlewares = [];

if (process.env.NODE_ENV !== 'production') {
  const logger = createLogger();
  middlewares.push(logger);
}

const reducer = combineReducers({
  app: appReducer,
  shared: sharedReducer,
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

const store = compose(
  persistState('app'),
  applyMiddleware(...middlewares)
)(createStore)(reducer);

window.addEventListener('DOMContentLoaded', () => {
  render(
    <StoreContext.Provider value={store}>
      <App />
    </StoreContext.Provider>,
    document.querySelector('#render-target')
  );
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(registration => {
      console.log(
        'ServiceWorker registration successful with scope: ',
        registration.scope
      );
    })
    .catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
}

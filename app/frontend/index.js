import React from 'react';
import { render } from 'react-dom';

import AppContainer from './containers/AppContainer';

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';

import createHistory from 'history/createBrowserHistory';
import { Route } from 'react-router-dom';
import {
  ConnectedRouter,
  routerReducer,
  routerMiddleware
} from 'react-router-redux';

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

import persistState from 'redux-localstorage';

import { createLogger } from 'redux-logger';

import firebase from 'firebase';
import firebaseui from 'firebaseui';

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DB_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
};
firebase.initializeApp(config);

const history = createHistory();

const middlewares = [];
middlewares.push(routerMiddleware(history));

if (process.env.NODE_ENV != 'production') {
  const logger = createLogger();
  middlewares.push(logger);
}

const reducer = combineReducers({
  router: routerReducer,
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
  settings: settingsReducer
});

const store = compose(persistState('app'), applyMiddleware(...middlewares))(
  createStore
)(reducer);

window.addEventListener('DOMContentLoaded', () => {
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Route component={AppContainer} />
      </ConnectedRouter>
    </Provider>,
    document.querySelector('#render-target')
  );
});

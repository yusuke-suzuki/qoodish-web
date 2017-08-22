import React from 'react';
import { render } from 'react-dom';

import AppContainer from './containers/AppContainer.js';

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';

import createHistory from 'history/createBrowserHistory';
import { Route } from 'react-router-dom';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';

import appReducer from './reducers/appReducer';
import sharedReducer from './reducers/sharedReducer';
import dashboardReducer from './reducers/dashboardReducer';
import mapDetailReducer from './reducers/mapDetailReducer';
import mapReviewsReducer from './reducers/mapReviewsReducer';
import gMapReducer from './reducers/gMapReducer';

import persistState from 'redux-localstorage';

import { createLogger } from 'redux-logger';

import firebase from 'firebase';
import firebaseui from 'firebaseui';

{
  let config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
  };
  firebase.initializeApp(config);
  window.FirebaseUI = new firebaseui.auth.AuthUI(firebase.auth());
};

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
  dashboard: dashboardReducer,
  mapDetail: mapDetailReducer,
  mapReviews: mapReviewsReducer,
  gMap: gMapReducer
});

const store = compose(
  persistState('app'),
  applyMiddleware(...middlewares)
)(createStore)(reducer);

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

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

import persistState from 'redux-localstorage';

import { createLogger } from 'redux-logger';

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
  shared: sharedReducer
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

import React from 'react';
import { render } from 'react-dom';

import App from './App';

import { StoreContext } from 'redux-react-hook';
import { RouterContext } from '@yusuke-suzuki/rize-router';
import { createBrowserHistory } from 'history';

import configureStore from './configureStore';

const { store } = configureStore();
const history = createBrowserHistory();

window.addEventListener('DOMContentLoaded', () => {
  render(
    <StoreContext.Provider value={store}>
      <RouterContext.Provider value={history}>
        <App />
      </RouterContext.Provider>
    </StoreContext.Provider>,
    document.querySelector('#render-target')
  );
});

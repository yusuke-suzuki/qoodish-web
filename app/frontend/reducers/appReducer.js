import {
  SIGN_IN,
  SIGN_OUT
} from '../actionTypes';

const initialState = {
  authenticated: false,
  accessToken: null,
  currentUser: {}
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case SIGN_IN:
      return Object.assign({}, state, {
        authenticated: true,
        accessToken: action.token,
        currentUser: action.user
      });
    case SIGN_OUT:
      return Object.assign({}, state, {
        authenticated: false,
        accessToken: null,
        currentUser: {}
      });
    default:
      return state;
  }
}

export default reducer;

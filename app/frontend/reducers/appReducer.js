import {
  SIGN_IN,
  SIGN_OUT
} from '../actionTypes';

const initialState = {
  authenticated: false,
  currentUser: null
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case SIGN_IN:
      return Object.assign({}, state, {
        authenticated: true,
        currentUser: action.payload.user
      });
    case SIGN_OUT:
      return Object.assign({}, state, {
        authenticated: false,
        currentUser: null
      });
    default:
      return state;
  }
}

export default reducer;

import {
  SIGN_IN,
  SIGN_OUT,
  FETCH_REGISTRATION_TOKEN,
  FETCH_MY_PROFILE,
  UPDATE_LINKED_PROVIDERS
} from '../actionTypes';

const initialState = {
  currentUser: {},
  registrationToken: null,
  linkedProviders: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGN_IN:
      return Object.assign({}, state, {
        currentUser: action.payload.user,
        registrationToken: null
      });
    case SIGN_OUT:
      return Object.assign({}, state, {
        registrationToken: null,
        linkedProviders: []
      });
    case FETCH_REGISTRATION_TOKEN:
      return Object.assign({}, state, {
        registrationToken: action.payload.token
      });
    case FETCH_MY_PROFILE:
      return Object.assign({}, state, {
        currentUser: action.payload.user
      });
    case UPDATE_LINKED_PROVIDERS:
      return Object.assign({}, state, {
        linkedProviders: action.payload.providerIds
      });
    default:
      return state;
  }
};

export default reducer;

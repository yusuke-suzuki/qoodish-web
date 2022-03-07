import { FETCH_MY_PROFILE, UPDATE_LINKED_PROVIDERS } from '../actionTypes';

const initialState = {
  profile: null,
  linkedProviders: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MY_PROFILE:
      return Object.assign({}, state, {
        profile: action.payload.user
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

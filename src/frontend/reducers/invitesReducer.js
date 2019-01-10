import {
  FETCH_INVITES,
  LOAD_INVITES_START,
  LOAD_INVITES_END
} from '../actionTypes';

const initialState = {
  invites: [],
  loadingInvites: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_INVITES:
      return Object.assign({}, state, {
        invites: action.payload.invites
      });
    case LOAD_INVITES_START:
      return Object.assign({}, state, {
        loadingInvites: true
      });
    case LOAD_INVITES_END:
      return Object.assign({}, state, {
        loadingInvites: false
      });
    default:
      return state;
  }
};

export default reducer;

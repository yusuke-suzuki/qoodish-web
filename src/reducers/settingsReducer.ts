import {
  OPEN_DELETE_ACCOUNT_DIALOG,
  CLOSE_DELETE_ACCOUNT_DIALOG,
  LOCATION_CHANGE
} from '../actionTypes';

const initialState = {
  deleteAccountDialogOpen: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_DELETE_ACCOUNT_DIALOG:
      return Object.assign({}, state, {
        deleteAccountDialogOpen: true
      });
    case CLOSE_DELETE_ACCOUNT_DIALOG:
      return Object.assign({}, state, {
        deleteAccountDialogOpen: false
      });
    case LOCATION_CHANGE:
      return Object.assign({}, state, {
        deleteAccountDialogOpen: false
      });
    default:
      return state;
  }
};

export default reducer;

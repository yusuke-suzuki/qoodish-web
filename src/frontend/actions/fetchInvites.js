import { FETCH_INVITES } from '../actionTypes';

const fetchInvites = invites => {
  return {
    type: FETCH_INVITES,
    payload: {
      invites: invites
    }
  };
};

export default fetchInvites;

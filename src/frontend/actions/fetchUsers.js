import { FETCH_USERS } from '../actionTypes';

const fetchUsers = users => {
  return {
    type: FETCH_USERS,
    payload: {
      users: users
    }
  };
};

export default fetchUsers;

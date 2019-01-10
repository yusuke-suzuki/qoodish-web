import { FETCH_USER_PROFILE } from '../actionTypes';

const fetchUserProfile = user => {
  return {
    type: FETCH_USER_PROFILE,
    payload: {
      user: user
    }
  };
};

export default fetchUserProfile;

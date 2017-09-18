import { FETCH_MY_PROFILE } from '../actionTypes';

const fetchMyProfile = (user) => {
  return {
    type: FETCH_MY_PROFILE,
    payload: {
      user: user
    }
  }
}

export default fetchMyProfile;

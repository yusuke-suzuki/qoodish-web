import { FETCH_REGISTRATION_TOKEN } from '../actionTypes';

const fetchRegistrationToken = (token) => {
  return {
    type: FETCH_REGISTRATION_TOKEN,
    payload: {
      token: token
    }
  }
}

export default fetchRegistrationToken;

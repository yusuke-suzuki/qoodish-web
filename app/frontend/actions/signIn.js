import { SIGN_IN } from '../actionTypes';

const signIn = (token, user) => {
  return {
    type: SIGN_IN,
    payload: {
      token: token,
      user: user
    }
  }
}

export default signIn;

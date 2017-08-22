import { SIGN_IN } from '../actionTypes';

const signIn = (user) => {
  return {
    type: SIGN_IN,
    payload: {
      user: user
    }
  }
}

export default signIn;

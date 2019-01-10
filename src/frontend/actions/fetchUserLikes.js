import { FETCH_USER_LIKES } from '../actionTypes';

const fetchUserLikes = likes => {
  return {
    type: FETCH_USER_LIKES,
    payload: {
      likes: likes
    }
  };
};

export default fetchUserLikes;

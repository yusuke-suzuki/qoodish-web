import { FETCH_LIKES } from '../actionTypes';

const fetchLikes = likes => {
  return {
    type: FETCH_LIKES,
    payload: {
      likes: likes
    }
  };
};

export default fetchLikes;

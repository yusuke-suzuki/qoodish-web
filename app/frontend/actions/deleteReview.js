import { DELETE_REVIEW } from '../actionTypes';

const deleteReview = (id) => {
  return {
    type: DELETE_REVIEW,
    payload: {
      id: id
    }
  }
}

export default deleteReview;

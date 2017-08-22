import { SELECT_PLACE_FOR_REVIEW } from '../actionTypes';

const selectPlaceForReview = (place) => {
  return {
    type: SELECT_PLACE_FOR_REVIEW,
    payload: {
      place: place
    }
  }
}

export default selectPlaceForReview;

import { GET_CURRENT_POSITION } from '../actionTypes';

const getCurrentPosition = (lat, lng) => {
  return {
    type: GET_CURRENT_POSITION,
    payload: {
      lat: lat,
      lng: lng
    }
  }
}

export default getCurrentPosition;

import { GET_MAP_BASE_POSITION } from '../actionTypes';

const getMapBasePosition = (lat, lng) => {
  return {
    type: GET_MAP_BASE_POSITION,
    payload: {
      lat: lat,
      lng: lng
    }
  };
};

export default getMapBasePosition;

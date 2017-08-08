import { REQUEST_MAP_CENTER } from '../actionTypes';

const requestMapCenter = (lat, lng) => {
  return {
    type: REQUEST_MAP_CENTER,
    payload: {
      position: {
        lat: lat,
        lng: lng
      }
    }
  }
}

export default requestMapCenter;

import { OPEN_SPOT_DETAIL } from '../actionTypes';

const openSpotDetail = (spot) => {
  return {
    type: OPEN_SPOT_DETAIL,
    payload: {
      spot: spot
    }
  }
}

export default openSpotDetail;

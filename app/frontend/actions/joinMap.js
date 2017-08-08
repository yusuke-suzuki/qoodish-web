import { JOIN_MAP } from '../actionTypes';

const joinMap = (currentMap) => {
  return {
    type: JOIN_MAP,
    payload: {
      currentMap: currentMap
    }
  }
}

export default joinMap;

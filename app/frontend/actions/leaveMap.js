import { LEAVE_MAP } from '../actionTypes';

const leaveMap = (currentMap) => {
  return {
    type: LEAVE_MAP,
    payload: {
      currentMap: currentMap
    }
  }
}

export default leaveMap;

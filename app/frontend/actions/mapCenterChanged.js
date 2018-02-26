import { MAP_CENTER_CHANGED } from '../actionTypes';

const mapCenterChanged = center => {
  return {
    type: MAP_CENTER_CHANGED,
    payload: {
      center: center
    }
  };
};

export default mapCenterChanged;

import { LOCATION_CHANGE } from '../actionTypes';

const locationChange = location => {
  return {
    type: LOCATION_CHANGE,
    payload: {
      location: location
    }
  };
};

export default locationChange;

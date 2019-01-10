import { LOCATION_CHANGE } from '../actionTypes';

const locationChange = location => {
  return {
    type: LOCATION_CHANGE,
    payload: {
      location: {
        pathname: location.pathname
      }
    }
  };
};

export default locationChange;

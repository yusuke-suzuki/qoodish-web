import { REQUEST_ROUTE } from '../actionTypes';

const requestRoute = (directions) => {
  return {
    type: REQUEST_ROUTE,
    payload: {
      directions: directions
    }
  }
}

export default requestRoute;

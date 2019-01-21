import { GET_HISTORY } from '../actionTypes';

const getHistory = history => {
  return {
    type: GET_HISTORY,
    payload: {
      history: history
    }
  };
};

export default getHistory;

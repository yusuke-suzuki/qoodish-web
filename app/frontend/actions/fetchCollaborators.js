import { FETCH_COLLABORATORS } from '../actionTypes';

const fetchCollaborators = collaborators => {
  return {
    type: FETCH_COLLABORATORS,
    payload: {
      collaborators: collaborators
    }
  };
};

export default fetchCollaborators;

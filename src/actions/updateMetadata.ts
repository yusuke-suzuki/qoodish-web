import { UPDATE_METADATA } from '../actionTypes';

const updateMetadata = metadata => {
  return {
    type: UPDATE_METADATA,
    payload: {
      metadata: metadata
    }
  };
};

export default updateMetadata;

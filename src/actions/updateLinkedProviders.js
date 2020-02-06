import { UPDATE_LINKED_PROVIDERS } from '../actionTypes';

const updateLinkedProviders = providerIds => {
  return {
    type: UPDATE_LINKED_PROVIDERS,
    payload: {
      providerIds: providerIds
    }
  };
};

export default updateLinkedProviders;

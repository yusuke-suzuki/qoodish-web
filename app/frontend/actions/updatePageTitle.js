import { UPDATE_PAGE_TITLE } from '../actionTypes';

const updatePageTitle = title => {
  return {
    type: UPDATE_PAGE_TITLE,
    payload: {
      title: title
    }
  };
};

export default updatePageTitle;

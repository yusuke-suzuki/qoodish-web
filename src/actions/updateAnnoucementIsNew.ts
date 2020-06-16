import { UPDATE_ANNOUNCEMENT_IS_NEW } from '../actionTypes';

const updateAnnouncementIsNew = isNew => {
  return {
    type: UPDATE_ANNOUNCEMENT_IS_NEW,
    payload: {
      isNew: isNew
    }
  };
};

export default updateAnnouncementIsNew;

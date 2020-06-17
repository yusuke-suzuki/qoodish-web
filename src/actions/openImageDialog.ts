import { OPEN_IMAGE_DIALOG } from '../actionTypes';

const openImageDialog = imageUrl => {
  return {
    type: OPEN_IMAGE_DIALOG,
    payload: {
      imageUrl: imageUrl
    }
  };
};

export default openImageDialog;

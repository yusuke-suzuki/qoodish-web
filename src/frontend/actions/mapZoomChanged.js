import { MAP_ZOOM_CHANGED } from '../actionTypes';

const mapZoomChanged = zoom => {
  return {
    type: MAP_ZOOM_CHANGED,
    payload: {
      zoom: zoom
    }
  };
};

export default mapZoomChanged;

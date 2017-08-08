import {
  OPEN_TOAST,
  CLOSE_TOAST,
  REQUEST_START,
  REQUEST_FINISH,
  UPDATE_WINDOW_SIZE,
  UPDATE_PAGE_TITLE
} from '../actionTypes';
import { isWidthUp } from 'material-ui/utils/withWidth';

const initialState = {
  toastOpen: false,
  toastMessage: '',
  blocking: false,
  width: '',
  large: true,
  pageTitle: ''
}

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case OPEN_TOAST:
      return Object.assign({}, state, {
        toastOpen: true,
        toastMessage: action.payload.message
      });
    case CLOSE_TOAST:
      return Object.assign({}, state, {
        toastOpen: false
      });
    case REQUEST_START:
      return Object.assign({}, state, {
        blocking: true
      });
    case REQUEST_FINISH:
      return Object.assign({}, state, {
        blocking: false
      });
    case UPDATE_WINDOW_SIZE:
      return Object.assign({}, state, {
        width: action.payload.width,
        large: isWidthUp('md', action.payload.width)
      });
    case UPDATE_PAGE_TITLE:
      return Object.assign({}, state, {
        pageTitle: action.payload.title ? action.payload.title : ''
      });
    default:
      return state;
  }
}

export default reducer;

import {
  OPEN_TOAST,
  CLOSE_TOAST,
  REQUEST_START,
  REQUEST_FINISH,
  UPDATE_WINDOW_SIZE,
  UPDATE_PAGE_TITLE,
  OPEN_ISSUE_DIALOG,
  CLOSE_ISSUE_DIALOG,
  LOAD_PLACES_START,
  LOAD_PLACES_END,
  SEARCH_PLACES,
  OPEN_LIKES_DIALOG,
  CLOSE_LIKES_DIALOG,
  FETCH_REVIEW_LIKES
} from '../actionTypes';
import { isWidthUp } from 'material-ui/utils/withWidth';

const initialState = {
  toastOpen: false,
  toastMessage: '',
  blocking: false,
  width: '',
  large: true,
  pageTitle: '',
  issueDialogOpen: false,
  issueTargetId: null,
  issueTargetType: null,
  pickedPlaces: [],
  loadingPlaces: false,
  likes: [],
  likesDialogOpen: false
};

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
    case OPEN_ISSUE_DIALOG:
      return Object.assign({}, state, {
        issueDialogOpen: true,
        issueTargetId: action.payload.contentId,
        issueTargetType: action.payload.contentType
      });
    case CLOSE_ISSUE_DIALOG:
      return Object.assign({}, state, {
        issueDialogOpen: false,
        issueTargetId: null,
        issueTargetType: null
      });
    case LOAD_PLACES_START:
      return Object.assign({}, state, {
        loadingPlaces: true
      });
    case LOAD_PLACES_END:
      return Object.assign({}, state, {
        loadingPlaces: false
      });
    case SEARCH_PLACES:
      return Object.assign({}, state, {
        pickedPlaces: action.payload.places
      });
    case OPEN_LIKES_DIALOG:
      return Object.assign({}, state, {
        likesDialogOpen: true
      });
    case CLOSE_LIKES_DIALOG:
      return Object.assign({}, state, {
        likesDialogOpen: false
      });
    case FETCH_REVIEW_LIKES:
      return Object.assign({}, state, {
        likes: action.payload.likes
      });
    default:
      return state;
  }
}

export default reducer;

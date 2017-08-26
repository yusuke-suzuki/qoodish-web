import { OPEN_ISSUE_DIALOG } from '../actionTypes';

const openIssueDialog = (contentId, contentType) => {
  return {
    type: OPEN_ISSUE_DIALOG,
    payload: {
      contentId: contentId,
      contentType: contentType
    }
  }
}

export default openIssueDialog;

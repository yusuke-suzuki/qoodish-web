import { OPEN_ISSUE_DIALOG } from '../actionTypes';

const openIssueDialog = (report) => {
  return {
    type: OPEN_ISSUE_DIALOG,
    payload: {
      report: report
    }
  }
}

export default openIssueDialog;

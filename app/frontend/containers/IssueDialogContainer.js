import { connect } from 'react-redux';
import IssueDialog from '../ui/IssueDialog';
import ApiClient from './ApiClient';
import closeIssueDialog from '../actions/closeIssueDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';

const mapStateToProps = state => {
  return {
    dialogOpen: state.shared.issueDialogOpen,
    issueTargetId: state.shared.issueTargetId,
    issueTargetType: state.shared.issueTargetType
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleCancelButtonClick: () => {
      dispatch(closeIssueDialog());
    },

    handleRequestDialogClose: () => {
      dispatch(closeIssueDialog());
    },

    handleSendButtonClick: async params => {
      dispatch(requestStart());
      const client = new ApiClient();
      const response = await client.issueContent(params);
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(closeIssueDialog());
        dispatch(openToast('Successfully sent. Thank you!'));
      } else {
        dispatch(openToast('Failed to issue content.'));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueDialog);

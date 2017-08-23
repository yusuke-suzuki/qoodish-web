import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import DeleteAccountDialog from '../ui/DeleteAccountDialog';
import closeDeleteAccountDialog from '../actions/closeDeleteAccountDialog';
import ApiClient from './ApiClient';
import signOut from '../actions/signOut';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import { sleep } from './Utils';

const mapStateToProps = (state) => {
  return {
    dialogOpen: state.settings.deleteAccountDialogOpen,
    currentUser: state.app.currentUser
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeDeleteAccountDialog());
    },

    handleDeleteButtonClick: async (currentUser) => {
      dispatch(requestStart());
      const client = new ApiClient;
      await client.deleteAccount(currentUser.uid);
      dispatch(requestFinish());
      dispatch(closeDeleteAccountDialog());
      // 少し待たないと dialog を close した際のエラー (material-ui 起因?) に巻き込まれて遷移できない
      await sleep(1000);
      dispatch(signOut());
      dispatch(closeDeleteAccountDialog());
      dispatch(openToast('Delete account successfully'));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteAccountDialog);

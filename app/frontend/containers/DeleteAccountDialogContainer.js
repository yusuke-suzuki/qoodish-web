import { connect } from 'react-redux';
import DeleteAccountDialog from '../ui/DeleteAccountDialog';
import closeDeleteAccountDialog from '../actions/closeDeleteAccountDialog';
import ApiClient from './ApiClient';
import signOut from '../actions/signOut';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import firebase from 'firebase/app';
import 'firebase/auth';

const mapStateToProps = state => {
  return {
    dialogOpen: state.settings.deleteAccountDialogOpen,
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeDeleteAccountDialog());
    },

    handleDeleteButtonClick: async currentUser => {
      dispatch(requestStart());
      const client = new ApiClient();
      await client.deleteAccount(currentUser.uid);
      await firebase.auth().signOut();
      dispatch(requestFinish());
      dispatch(closeDeleteAccountDialog());
      dispatch(signOut());
      dispatch(closeDeleteAccountDialog());
      dispatch(openToast('Delete account successfully'));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  DeleteAccountDialog
);

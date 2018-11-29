import React from 'react';
import { connect } from 'react-redux';
import DeleteAccountDialog from '../ui/DeleteAccountDialog';
import closeDeleteAccountDialog from '../actions/closeDeleteAccountDialog';
import ApiClient from './ApiClient';
import signOut from '../actions/signOut';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import getFirebase from '../utils/getFirebase';
import getFirebaseAuth from '../utils/getFirebaseAuth';

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
      const firebase = await getFirebase();
      await getFirebaseAuth();
      await firebase.auth().signOut();
      dispatch(requestFinish());
      dispatch(closeDeleteAccountDialog());
      dispatch(signOut());
      dispatch(closeDeleteAccountDialog());
      dispatch(openToast('Delete account successfully'));
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(
  DeleteAccountDialog
));

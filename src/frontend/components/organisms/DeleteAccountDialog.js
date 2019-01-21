import React, { useState, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import I18n from '../../utils/I18n';

import closeDeleteAccountDialog from '../../actions/closeDeleteAccountDialog';
import ApiClient from '../../utils/ApiClient';
import signOut from '../../actions/signOut';
import signIn from '../../actions/signIn';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import getFirebase from '../../utils/getFirebase';
import getFirebaseAuth from '../../utils/getFirebaseAuth';

const styles = {
  deleteButton: {
    color: 'white',
    backgroundColor: 'red'
  }
};

const DeleteAccountDialog = props => {
  const mapState = useCallback(
    state => ({
      dialogOpen: state.settings.deleteAccountDialogOpen,
      currentUser: state.app.currentUser,
      history: state.shared.history
    }),
    []
  );
  const { dialogOpen, currentUser, history } = useMappedState(mapState);
  const dispatch = useDispatch();

  const [check, setCheck] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const handleCheckChange = useCallback(() => {
    setCheck(!check);
    setDisabled(!disabled);
  });

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeDeleteAccountDialog());
    setCheck(false);
    setDisabled(true);
  });

  const handleDeleteButtonClick = useCallback(async () => {
    dispatch(requestStart());
    const client = new ApiClient();
    await client.deleteAccount(currentUser.uid);
    const firebase = await getFirebase();
    await getFirebaseAuth();
    await firebase.auth().signOut();
    dispatch(signOut());

    await firebase.auth().signInAnonymously();
    const firebaseUser = firebase.auth().currentUser;
    dispatch(
      signIn({
        uid: firebaseUser.uid,
        isAnonymous: true
      })
    );
    dispatch(closeDeleteAccountDialog());
    dispatch(requestFinish());
    history.push('/login');
    dispatch(openToast('Delete account successfully'));
  });

  return (
    <Dialog open={dialogOpen} onClose={handleRequestDialogClose} fullWidth>
      <DialogTitle>{I18n.t('sure to delete account')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{I18n.t('delete account detail')}</DialogContentText>
        <br />
        <FormControlLabel
          control={<Checkbox checked={check} onChange={handleCheckChange} />}
          label={I18n.t('understand this cannot be undone')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRequestDialogClose}>{I18n.t('cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleDeleteButtonClick}
          disabled={disabled}
          style={disabled ? {} : styles.deleteButton}
        >
          {I18n.t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DeleteAccountDialog);

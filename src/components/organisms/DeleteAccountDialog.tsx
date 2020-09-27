import React, { useState, useCallback, useContext } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { useHistory } from '@yusuke-suzuki/rize-router';

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
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import getFirebase from '../../utils/getFirebase';
import getFirebaseAuth from '../../utils/getFirebaseAuth';

import { UsersApi } from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    deleteButton: {
      color: 'white',
      backgroundColor: 'red'
    }
  })
);

const DeleteAccountDialog = () => {
  const { currentUser } = useContext(AuthContext);

  const mapState = useCallback(
    state => ({
      dialogOpen: state.settings.deleteAccountDialogOpen
    }),
    []
  );
  const { dialogOpen } = useMappedState(mapState);
  const dispatch = useDispatch();
  const history = useHistory();

  const [check, setCheck] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const handleCheckChange = useCallback(() => {
    setCheck(!check);
    setDisabled(!disabled);
  }, [check, disabled]);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeDeleteAccountDialog());
    setCheck(false);
    setDisabled(true);
  }, [dispatch]);

  const handleDeleteButtonClick = useCallback(async () => {
    dispatch(requestStart());
    const apiInstance = new UsersApi();

    apiInstance.usersUserIdDelete(
      currentUser.uid,
      async (error, data, response) => {
        const firebase = await getFirebase();
        await getFirebaseAuth();
        await firebase.auth().signOut();

        localStorage.removeItem('registrationToken');

        dispatch(closeDeleteAccountDialog());
        dispatch(requestFinish());
        history.push('/login');
        dispatch(openToast('Delete account successfully'));
      }
    );
  }, [dispatch, history, currentUser]);

  const classes = useStyles();

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
          className={disabled ? '' : classes.deleteButton}
        >
          {I18n.t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DeleteAccountDialog);

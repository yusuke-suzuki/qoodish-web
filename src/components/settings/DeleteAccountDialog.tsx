import { LoadingButton } from '@mui/lab';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

function DeleteAccountDialog({ open, onClose, onDeleted }: Props) {
  const dictionary = useDictionary();
  const { currentUser } = useContext(AuthContext);

  const [check, setCheck] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCheckChange = useCallback(() => {
    setCheck(!check);
    setDisabled(!disabled);
  }, [check, disabled]);

  const handleExited = useCallback(() => {
    setCheck(false);
    setDisabled(true);
  }, []);

  const handleDeleteButtonClick = useCallback(async () => {
    setLoading(true);

    const token = await currentUser.getIdToken();

    const headers = new Headers({
      Accept: 'application/json',
      'Accept-Language': window.navigator.language,
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`
    });

    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/users/${currentUser.uid}`,
      {
        method: 'DELETE',
        headers: headers
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        enqueueSnackbar(dictionary['delete account success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentUser, dictionary, onClose, onDeleted]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      TransitionProps={{
        onExited: handleExited
      }}
    >
      <DialogTitle>{dictionary['sure to delete account']}</DialogTitle>
      <DialogContent>
        <DialogContentText gutterBottom>
          {dictionary['delete account detail']}
        </DialogContentText>

        <FormControlLabel
          control={
            <Checkbox
              checked={check}
              onChange={handleCheckChange}
              color="success"
            />
          }
          label={dictionary['understand this cannot be undone']}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {dictionary.cancel}
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleDeleteButtonClick}
          color="error"
          disabled={disabled}
          loading={loading}
        >
          {dictionary.delete}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default memo(DeleteAccountDialog);

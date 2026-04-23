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
import { deleteAccount } from '../../actions/users';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

function DeleteAccountDialog({ open, onClose, onDeleted }: Props) {
  const dictionary = useDictionary();
  const { uid } = useContext(AuthContext);

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

    try {
      const result = await deleteAccount(uid);

      if (result.success) {
        enqueueSnackbar(dictionary['delete account success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
      } else {
        enqueueSnackbar(result.error, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [uid, dictionary, onClose, onDeleted]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      slotProps={{
        transition: {
          onExited: handleExited
        }
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
        <Button
          variant="contained"
          onClick={handleDeleteButtonClick}
          color="error"
          disabled={disabled}
          loading={loading}
        >
          {dictionary.delete}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(DeleteAccountDialog);

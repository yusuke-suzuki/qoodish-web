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
import { memo, useActionState, useContext, useState } from 'react';
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

  const [, submitAction, isPending] = useActionState<null, FormData>(
    async (_prevState, _formData) => {
      if (!uid) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return null;
      }

      try {
        const result = await deleteAccount(uid);

        if (result.success) {
          enqueueSnackbar(dictionary['delete account success'], {
            variant: 'success'
          });

          onClose();
          onDeleted();
          return null;
        }

        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });
        return null;
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return null;
      }
    },
    null
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      slotProps={{
        transition: {
          onExited: () => setCheck(false)
        }
      }}
    >
      <form action={submitAction}>
        <DialogTitle>{dictionary['sure to delete account']}</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            {dictionary['delete account detail']}
          </DialogContentText>

          <FormControlLabel
            control={
              <Checkbox
                checked={check}
                onChange={() => setCheck((prev) => !prev)}
                color="success"
              />
            }
            label={dictionary['understand this cannot be undone']}
          />
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={onClose}
            color="inherit"
            disabled={isPending}
          >
            {dictionary.cancel}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={!check}
            loading={isPending}
          >
            {dictionary.delete}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default memo(DeleteAccountDialog);

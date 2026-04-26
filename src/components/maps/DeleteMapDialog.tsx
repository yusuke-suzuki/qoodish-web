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
import { memo, useActionState, useState } from 'react';
import type { AppMap } from '../../../types';
import { deleteMap } from '../../actions/maps';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  map: AppMap | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const DeleteMapDialog = ({ map, open, onClose, onDeleted }: Props) => {
  const dictionary = useDictionary();

  const [check, setCheck] = useState(false);

  const [, submitAction, isPending] = useActionState<null, FormData>(
    async (_prevState, _formData) => {
      if (!map) {
        enqueueSnackbar(dictionary['delete map failed'], { variant: 'error' });
        return null;
      }

      try {
        const result = await deleteMap(map.id);

        if (result.success) {
          enqueueSnackbar(dictionary['delete map success'], {
            variant: 'success'
          });

          onClose();
          onDeleted();
          return null;
        }

        enqueueSnackbar(result.error ?? dictionary['delete map failed'], {
          variant: 'error'
        });
        return null;
      } catch (_error) {
        enqueueSnackbar(dictionary['delete map failed'], { variant: 'error' });
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
        <DialogTitle>{dictionary['sure to delete map']}</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            {dictionary['delete map detail']}
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
};

export default memo(DeleteMapDialog);

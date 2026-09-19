import { enqueueSnackbar } from 'notistack';
import { memo, useCallback } from 'react';
import type { Pin } from '../../../types/index.ts';
import { deletePin } from '../../actions/pins.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog.tsx';

type Props = {
  pin: Pin | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const DeletePinDialog = ({ pin, open, onClose, onDeleted }: Props) => {
  const dictionary = useDictionary();

  const handleConfirm = useCallback(async () => {
    if (!pin) {
      enqueueSnackbar(dictionary['delete pin failed'], { variant: 'error' });
      return;
    }

    try {
      const result = await deletePin(pin.id, pin.map.id, pin.author.id);

      if (result.success) {
        enqueueSnackbar(dictionary['delete pin success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
        return;
      }

      enqueueSnackbar(result.error ?? dictionary['delete pin failed'], {
        variant: 'error'
      });
    } catch (_error) {
      enqueueSnackbar(dictionary['delete pin failed'], { variant: 'error' });
    }
  }, [pin, dictionary, onClose, onDeleted]);

  return (
    <ConfirmDeleteDialog
      open={open}
      title={dictionary['sure to delete pin']}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
};

export default memo(DeletePinDialog);

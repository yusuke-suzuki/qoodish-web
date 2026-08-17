import { enqueueSnackbar } from 'notistack';
import { memo, useCallback } from 'react';
import { deleteAccount } from '../../actions/users';
import useDictionary from '../../hooks/useDictionary';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog';

type Props = {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

function DeleteAccountDialog({ open, onClose, onDeleted }: Props) {
  const dictionary = useDictionary();

  const handleConfirm = useCallback(async () => {
    try {
      const result = await deleteAccount();

      if (result.success) {
        enqueueSnackbar(dictionary['delete account success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
        return;
      }

      enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
        variant: 'error'
      });
    } catch (_error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    }
  }, [dictionary, onClose, onDeleted]);

  return (
    <ConfirmDeleteDialog
      open={open}
      title={dictionary['sure to delete account']}
      description={dictionary['delete account detail']}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
}

export default memo(DeleteAccountDialog);

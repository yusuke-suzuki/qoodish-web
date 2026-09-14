import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useContext } from 'react';
import { deleteAccount } from '../../actions/users.ts';
import ProfileContext from '../../context/ProfileContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog.tsx';

type Props = {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

function DeleteAccountDialog({ open, onClose, onDeleted }: Props) {
  const dictionary = useDictionary();
  const userId = useContext(ProfileContext)?.id;

  const handleConfirm = useCallback(async () => {
    try {
      const result = await deleteAccount(userId);

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
  }, [dictionary, onClose, onDeleted, userId]);

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

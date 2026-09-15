import { enqueueSnackbar } from 'notistack';
import { memo, useCallback } from 'react';
import { deleteAccount } from '../../actions/users.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog.tsx';
import ProfileBoundary from '../common/ProfileBoundary.tsx';

type Props = {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

type ContentProps = Props & {
  userId?: number;
};

function DeleteAccountDialogContent({
  open,
  onClose,
  onDeleted,
  userId
}: ContentProps) {
  const dictionary = useDictionary();

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

export default memo(function DeleteAccountDialog(props: Props) {
  return (
    <ProfileBoundary>
      {(profile) => (
        <DeleteAccountDialogContent {...props} userId={profile?.id} />
      )}
    </ProfileBoundary>
  );
});

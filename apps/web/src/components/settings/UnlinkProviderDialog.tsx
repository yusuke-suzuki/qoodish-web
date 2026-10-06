import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import ConfirmDialog from '../common/ConfirmDialog.tsx';

type Props = {
  open: boolean;
  onClose: () => void;
  onUnlink: () => Promise<void>;
};

function UnlinkProviderDialog({ open, onClose, onUnlink }: Props) {
  const dictionary = useDictionary();

  const handleConfirm = async () => {
    await onUnlink();
    onClose();
  };

  return (
    <ConfirmDialog
      open={open}
      title={dictionary['unlink provider']}
      description={dictionary['unlink provider detail']}
      confirmLabel={dictionary.unlink}
      confirmColor="error"
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
}

export default memo(UnlinkProviderDialog);

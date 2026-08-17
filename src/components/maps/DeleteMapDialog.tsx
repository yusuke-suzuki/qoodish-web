import { enqueueSnackbar } from 'notistack';
import { memo, useCallback } from 'react';
import type { AppMap } from '../../../types';
import { deleteMap } from '../../actions/maps';
import useDictionary from '../../hooks/useDictionary';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog';

type Props = {
  map: AppMap | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const DeleteMapDialog = ({ map, open, onClose, onDeleted }: Props) => {
  const dictionary = useDictionary();

  const handleConfirm = useCallback(async () => {
    if (!map) {
      enqueueSnackbar(dictionary['delete map failed'], { variant: 'error' });
      return;
    }

    try {
      const result = await deleteMap(map.id);

      if (result.success) {
        enqueueSnackbar(dictionary['delete map success'], {
          variant: 'success'
        });

        onClose();
        onDeleted();
        return;
      }

      enqueueSnackbar(result.error ?? dictionary['delete map failed'], {
        variant: 'error'
      });
    } catch (_error) {
      enqueueSnackbar(dictionary['delete map failed'], { variant: 'error' });
    }
  }, [map, dictionary, onClose, onDeleted]);

  return (
    <ConfirmDeleteDialog
      open={open}
      title={dictionary['sure to delete map']}
      description={dictionary['delete map detail']}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
};

export default memo(DeleteMapDialog);

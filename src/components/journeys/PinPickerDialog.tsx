import { Check, HistoryEdu, Place } from '@mui/icons-material';
import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { memo } from 'react';
import type { Pin } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import AppDialog from '../common/AppDialog.tsx';
import NoContents from '../common/NoContents.tsx';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (pin: Pin) => void;
  pins: Pin[];
  usedPinIds: Set<number>;
};

export default memo(function PinPickerDialog({
  open,
  onClose,
  onSelect,
  pins,
  usedPinIds
}: Props) {
  const dictionary = useDictionary();

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['select pin']}
      fullScreenOnMobile
      dividers
      disableContentPadding
      cancelLabel={dictionary.close}
    >
      {pins.length < 1 ? (
        <NoContents icon={Place} message={dictionary['pins will see here']} />
      ) : (
        <List disablePadding>
          {pins.map((pin) => (
            <ListItemButton key={pin.id} divider onClick={() => onSelect(pin)}>
              <ListItemAvatar>
                {pin.images.length > 0 ? (
                  <Avatar
                    alt={pin.name}
                    variant="rounded"
                    src={pin.images[0].avatar}
                  />
                ) : (
                  <Avatar alt={pin.name} variant="rounded">
                    <HistoryEdu />
                  </Avatar>
                )}
              </ListItemAvatar>
              <ListItemText
                primary={pin.name}
                secondary={pin.comment}
                slotProps={{
                  primary: {
                    noWrap: true
                  },
                  secondary: {
                    noWrap: true
                  }
                }}
              />
              {usedPinIds.has(pin.id) && (
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <Check color="disabled" fontSize="small" />
                </ListItemIcon>
              )}
            </ListItemButton>
          ))}
        </List>
      )}
    </AppDialog>
  );
});

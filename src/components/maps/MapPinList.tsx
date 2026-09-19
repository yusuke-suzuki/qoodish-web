import { HistoryEdu, Place } from '@mui/icons-material';
import {
  Avatar,
  Box,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { memo } from 'react';
import type { Pin } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import AuthorAvatar from '../common/AuthorAvatar.tsx';
import NoContents from '../common/NoContents.tsx';

type Props = {
  pins: Pin[];
  onPinClick?: (pin: Pin) => void;
};

function MapPinList({ pins, onPinClick }: Props) {
  const dictionary = useDictionary();
  const { push } = useRouter();
  const pathname = usePathname();

  const handleClick = (pin: Pin) => {
    if (onPinClick) {
      onPinClick(pin);
    }
    push(`${pathname}?lat=${pin.latitude}&lng=${pin.longitude}&zoom=17`, {
      scroll: false
    });
  };

  // The rows carry their own padding, so the panel around this list has none
  // to give the empty state.
  if (pins.length < 1) {
    return (
      <Box sx={{ py: 4 }}>
        <NoContents icon={Place} message={dictionary['pins will see here']} />
      </Box>
    );
  }

  return (
    <List disablePadding>
      {pins.map((pin) => (
        <ListItemButton
          key={pin.id}
          divider
          onClick={() => handleClick(pin)}
          disableGutters
        >
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
          <AuthorAvatar
            key={pin.id}
            author={pin.author}
            sx={{
              width: 24,
              height: 24
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
}

export default memo(MapPinList);

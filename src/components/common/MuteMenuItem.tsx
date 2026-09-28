import { VolumeOff, VolumeUp } from '@mui/icons-material';
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  type MenuItemProps
} from '@mui/material';
import useDictionary from '../../hooks/useDictionary.ts';

type Props = Omit<MenuItemProps, 'children'> & {
  muting: boolean;
};

export default function MuteMenuItem({ muting, ...menuItemProps }: Props) {
  const dictionary = useDictionary();

  return (
    <MenuItem {...menuItemProps}>
      <ListItemIcon>
        {muting ? (
          <VolumeUp fontSize="small" />
        ) : (
          <VolumeOff fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText primary={muting ? dictionary.unmute : dictionary.mute} />
    </MenuItem>
  );
}

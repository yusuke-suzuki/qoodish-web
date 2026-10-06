import { Block } from '@mui/icons-material';
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  type MenuItemProps
} from '@mui/material';
import useDictionary from '../../hooks/useDictionary.ts';

type Props = Omit<MenuItemProps, 'children'> & {
  blocking: boolean;
};

export default function BlockMenuItem({ blocking, ...menuItemProps }: Props) {
  const dictionary = useDictionary();

  if (blocking) {
    return (
      <MenuItem {...menuItemProps}>
        <ListItemIcon>
          <Block fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={dictionary.unblock} />
      </MenuItem>
    );
  }

  return (
    <MenuItem {...menuItemProps}>
      <ListItemIcon>
        <Block color="error" fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={dictionary.block}
        slotProps={{ primary: { color: 'error' } }}
      />
    </MenuItem>
  );
}

import {
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography
} from '@mui/material';
import { memo, type ReactNode } from 'react';
import type { AutocompleteOption } from '../../../types/index.ts';
import { highlightMatches } from '../../utils/highlightMatches.ts';

type Props = {
  option: AutocompleteOption;
  inputValue: string;
  onClick: () => void;
  avatar: ReactNode;
};

export default memo(function AutocompleteListItem({
  option,
  inputValue,
  onClick,
  avatar
}: Props) {
  const parts = highlightMatches(option.label, inputValue);

  return (
    <ListItem key={option.value} disableGutters dense>
      <ListItemButton onClick={onClick}>
        <ListItemAvatar>{avatar}</ListItemAvatar>
        <ListItemText
          disableTypography
          primary={parts.map((part) => (
            <Typography
              key={part.start}
              variant="subtitle1"
              component="span"
              sx={{
                fontWeight: part.highlight ? 700 : 400
              }}
            >
              {part.text}
            </Typography>
          ))}
        />
      </ListItemButton>
    </ListItem>
  );
});

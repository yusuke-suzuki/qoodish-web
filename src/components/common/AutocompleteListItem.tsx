import {
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography
} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { type ReactNode, memo } from 'react';
import type { AutocompleteOption } from '../../../types';

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
  const matches = match(option.label, inputValue);
  const parts = matches ? parse(option.label, matches) : [];

  return (
    <ListItem key={option.value} disableGutters dense>
      <ListItemButton onClick={onClick}>
        <ListItemAvatar>{avatar}</ListItemAvatar>
        <ListItemText
          disableTypography
          primary={parts.map((part, index) => (
            <Typography
              key={`${part.text}-${index}`}
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

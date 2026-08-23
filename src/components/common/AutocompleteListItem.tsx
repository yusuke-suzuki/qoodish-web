import {
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography
} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { memo, type ReactNode } from 'react';
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
              // biome-ignore lint/suspicious/noArrayIndexKey: parse() splits one label into segments that repeat the same text, so the index is what tells them apart
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

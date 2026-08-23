import { Map as MapIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { memo } from 'react';
import type { AppMap } from '../../../types';

type Props = {
  option: AppMap;
  inputValue: string;
};

export default memo(function MapAutocompleteOption({
  option,
  inputValue
}: Props) {
  const matches = match(option.name, inputValue);
  const parts = matches ? parse(option.name, matches) : [];

  return (
    <Grid container alignItems="center" data-test="map-item">
      <Grid>
        <MapIcon color="primary" />
      </Grid>
      <Grid size="grow">
        {parts.map((part, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: parse() splits one name into segments that repeat the same text, so the index is what tells them apart
            key={`${part.text}-${index}`}
            style={{ fontWeight: part.highlight ? 700 : 400 }}
          >
            {part.text}
          </span>
        ))}

        <Typography variant="body2" color="text.secondary">
          {option.description}
        </Typography>
      </Grid>
    </Grid>
  );
});

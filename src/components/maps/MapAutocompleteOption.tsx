import { Map as MapIcon } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { memo, useMemo } from 'react';
import { AppMap } from '../../../types';

type Props = {
  option: AppMap;
  inputValue: string;
};

export default memo(function MapAutocompleteOption({
  option,
  inputValue
}: Props) {
  const parts = useMemo(() => {
    const text = option.name;
    const matches = match(text, inputValue);

    return matches ? parse(text, matches) : [];
  }, [option, inputValue]);

  return (
    <Grid container alignItems="center" data-test="map-item">
      <Grid item>
        <MapIcon color="primary" />
      </Grid>
      <Grid item xs>
        {parts.map((part, index) => (
          <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
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

import { memo, useMemo } from 'react';
import parse from 'autosuggest-highlight/parse';
import {
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core';
import { LocationOn } from '@material-ui/icons';

type Props = {
  option: google.maps.places.AutocompletePrediction;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      color: theme.palette.text.secondary,
      marginRight: theme.spacing(2)
    }
  })
);

export default memo(function PlaceAutocompleteOption(props: Props) {
  const { option } = props;

  const classes = useStyles();

  const matches = useMemo(() => {
    return option.structured_formatting.main_text_matched_substrings;
  }, [option]);

  const parts = useMemo(() => {
    return matches
      ? parse(
          option.structured_formatting.main_text,
          matches.map(match => [match.offset, match.offset + match.length])
        )
      : [];
  }, [option, matches]);

  return (
    <Grid container alignItems="center">
      <Grid item>
        <LocationOn className={classes.icon} />
      </Grid>
      <Grid item xs>
        {parts.map((part, index) => (
          <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
            {part.text}
          </span>
        ))}

        <Typography variant="body2" color="textSecondary">
          {option.structured_formatting.secondary_text}
        </Typography>
      </Grid>
    </Grid>
  );
});

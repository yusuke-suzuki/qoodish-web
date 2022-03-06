import { memo, useMemo } from 'react';
import {
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core';
import { Map } from '@material-ui/icons';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

type Props = {
  option: any;
  inputValue: string;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      marginRight: theme.spacing(2)
    }
  })
);

export default memo(function MapAutocompleteOption(props: Props) {
  const { option, inputValue } = props;

  const classes = useStyles();

  const parts = useMemo(() => {
    const text = option.name;
    const matches = match(text, inputValue);

    return matches ? parse(text, matches) : [];
  }, [option, inputValue]);

  return (
    <Grid container alignItems="center" data-test="map-item">
      <Grid item>
        <Map className={classes.icon} color="primary" />
      </Grid>
      <Grid item xs>
        {parts.map((part, index) => (
          <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
            {part.text}
          </span>
        ))}

        <Typography variant="body2" color="textSecondary">
          {option.name}
        </Typography>
      </Grid>
    </Grid>
  );
});

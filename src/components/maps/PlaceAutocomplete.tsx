import { LocationOn, Search } from '@mui/icons-material';
import {
  Autocomplete,
  type AutocompleteInputChangeReason,
  InputAdornment,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import {
  type MutableRefObject,
  memo,
  type SyntheticEvent,
  useRef,
  useState
} from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import { usePlaceSearch } from '../../hooks/usePlaceSearch.ts';
import { formatDistanceMeters } from '../../utils/geo.ts';
import { toLocale } from '../../utils/locales.ts';

type Props = {
  ref: MutableRefObject<HTMLInputElement>;
  onChange: (place: google.maps.places.Place) => void;
  label: string;
  autoFocus?: boolean;
};

function PlaceAutocomplete({ ref, onChange, label, autoFocus = true }: Props) {
  const dictionary = useDictionary();

  const { lang } = useParams<{ lang: string }>();
  const locale = toLocale(lang);

  const [value, setValue] = useState<google.maps.places.PlacePrediction | null>(
    null
  );
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');

  const selectionIdRef = useRef(0);

  const { predictions, isLoading, resolvePlace } = usePlaceSearch(query);

  // MUI reads a value that is missing from the options as invalid, so the
  // selection is kept in the list whenever the latest suggestions drop it.
  const options =
    !value ||
    predictions.some((prediction) => prediction.placeId === value.placeId)
      ? predictions
      : [value, ...predictions];

  const handleChange = async (
    _event: SyntheticEvent,
    prediction: google.maps.places.PlacePrediction | null
  ) => {
    // A Place that resolves late must not overwrite a suggestion the visitor
    // picked while it was still loading.
    const selectionId = ++selectionIdRef.current;

    setValue(prediction);

    if (!prediction) {
      return;
    }

    try {
      const place = await resolvePlace(prediction);

      if (selectionId !== selectionIdRef.current) {
        return;
      }

      onChange(place);
    } catch {
      if (selectionId !== selectionIdRef.current) {
        return;
      }

      setValue(null);

      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    }
  };

  const handleInputChange = (
    _event: SyntheticEvent,
    newInputValue: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setInputValue(newInputValue);

    // Selecting a suggestion writes its label back through here, and searching
    // for that would open a billing session the moment resolvePlace closed
    // one, with no place lookup left to close it. Only the visitor's own
    // typing is worth a query; the reasons that write a label back matter
    // just when they empty the field, which has to drop the suggestions too.
    if (reason === 'input' || newInputValue === '') {
      setQuery(newInputValue);
    }
  };

  return (
    <Autocomplete
      fullWidth
      autoComplete
      includeInputInList
      filterSelectedOptions
      forcePopupIcon={false}
      // The input is width: 0, so the field collapses inside a container that
      // sizes to its contents, as the map control does. Narrow screens get
      // their width from fullWidth instead.
      sx={{ minWidth: { xs: 0, md: 320 } }}
      options={options}
      loading={isLoading}
      loadingText={dictionary.loading}
      noOptionsText={dictionary['place not found']}
      value={value}
      inputValue={inputValue}
      onChange={handleChange}
      onInputChange={handleInputChange}
      filterOptions={(unfiltered) => unfiltered}
      getOptionKey={(option) => option.placeId}
      getOptionLabel={(option) => option.text.text}
      isOptionEqualToValue={(option, selected) =>
        option.placeId === selected.placeId
      }
      renderOption={({ key, ...optionProps }, option) => (
        <ListItem key={key} divider {...optionProps}>
          <ListItemIcon>
            <Stack alignItems="center" spacing={0.5}>
              <LocationOn />
              {option.distanceMeters !== null && (
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceMeters(option.distanceMeters, locale)}
                </Typography>
              )}
            </Stack>
          </ListItemIcon>
          <ListItemText
            primary={option.mainText?.text ?? option.text.text}
            secondary={option.secondaryText?.text}
            slotProps={{
              primary: { noWrap: true },
              secondary: { noWrap: true }
            }}
          />
        </ListItem>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          autoFocus={autoFocus}
          placeholder={label}
          inputRef={ref}
          slotProps={{
            input: {
              ...params.InputProps,
              margin: 'none',
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            },

            htmlInput: {
              ...params.inputProps,
              'aria-label': label
            }
          }}
        />
      )}
    />
  );
}

export default memo(PlaceAutocomplete);

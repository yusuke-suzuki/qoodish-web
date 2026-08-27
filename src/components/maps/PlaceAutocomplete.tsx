import { LocationOn, Search } from '@mui/icons-material';
import {
  Autocomplete,
  type AutocompleteInputChangeReason,
  InputAdornment,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  type MutableRefObject,
  memo,
  type SyntheticEvent,
  useRef,
  useState
} from 'react';
import useDictionary from '../../hooks/useDictionary';
import { usePlaceSearch } from '../../hooks/usePlaceSearch';

type Props = {
  ref: MutableRefObject<HTMLInputElement>;
  onChange: (place: google.maps.places.Place) => void;
  label: string;
  autoFocus?: boolean;
};

function PlaceAutocomplete({ ref, onChange, label, autoFocus = true }: Props) {
  const dictionary = useDictionary();

  const [value, setValue] = useState<google.maps.places.PlacePrediction | null>(
    null
  );
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');

  const selectionIdRef = useRef(0);

  const { predictions, isLoading, resolvePlace } = usePlaceSearch(query);

  // 選択済みの候補が options から外れると MUI が value を不正とみなすため、
  // 最新の候補に含まれていない場合は選択済みの候補を補う
  const options =
    !value ||
    predictions.some((prediction) => prediction.placeId === value.placeId)
      ? predictions
      : [value, ...predictions];

  const handleChange = async (
    _event: SyntheticEvent,
    prediction: google.maps.places.PlacePrediction | null
  ) => {
    // Place の取得中に別の候補が選択された場合、
    // 遅れて解決した Place で新しい選択を上書きしないようにする
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

    // 候補選択時に書き戻されるラベルまで検索すると、resolvePlace が終了させた
    // 直後に新しいセッションが始まり、fetchFields で閉じられないまま課金される
    if (reason === 'input' || reason === 'clear') {
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
        <ListItem key={key} {...optionProps}>
          <ListItemIcon>
            <LocationOn />
          </ListItemIcon>
          <ListItemText
            primary={option.mainText?.text ?? option.text.text}
            secondary={option.secondaryText?.text}
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

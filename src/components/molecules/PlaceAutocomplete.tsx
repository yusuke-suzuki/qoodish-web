import { memo, useCallback, useEffect, useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { InputAdornment, TextField } from '@material-ui/core';
import { useAutocompleteService } from '../../hooks/useAutocompleteService';
import PlaceAutocompleteOption from './PlaceAutocompleteOption';
import { Place } from '@material-ui/icons';

type Props = {
  onChange: Function;
  label: string;
  defaultValue?: {
    place_id: string;
    name: string;
  };
};

export default memo(function PlacesAutocomplete(props: Props) {
  const { onChange, label, defaultValue } = props;
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);

  const { fetchPlacePredictions } = useAutocompleteService();

  const handleChange = useCallback(
    (_event, newValue) => {
      setOptions(newValue ? [newValue, ...options] : options);
      setValue(newValue);
      onChange(newValue);
    },
    [onChange, options]
  );

  const handleInputChange = useCallback((_event, newInputValue) => {
    setInputValue(newInputValue);
  }, []);

  useEffect(() => {
    if (defaultValue) {
      setValue({
        place_id: defaultValue.place_id,
        description: defaultValue.name
      });
    }
  }, [defaultValue]);

  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetchPlacePredictions(inputValue, results => {
      if (active) {
        let newOptions = [];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue]);

  return (
    <Autocomplete
      id="places-autocomplete"
      getOptionLabel={option =>
        typeof option === 'string' ? option : option.description
      }
      filterOptions={x => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          fullWidth
          margin="normal"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Place color="primary" />
              </InputAdornment>
            )
          }}
        />
      )}
      renderOption={option => {
        return <PlaceAutocompleteOption option={option} />;
      }}
    />
  );
});

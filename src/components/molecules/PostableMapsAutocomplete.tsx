import { memo, useCallback, useEffect, useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { InputAdornment, TextField } from '@material-ui/core';
import { Map } from '@material-ui/icons';
import MapAutocompleteOption from './MapAutocompleteOption';
import getMapPredictions from '../../utils/getMapPredictions';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import fetchPostableMaps from '../../actions/fetchPostableMaps';
import { useLocale } from '../../hooks/useLocale';

type Props = {
  onChange: Function;
  defaultValue?: number;
  required?: boolean;
};

export default memo(function PostableMapsAutocomplete(props: Props) {
  const { onChange, defaultValue, required } = props;

  const dispatch = useDispatch();
  const { I18n } = useLocale();

  const mapState = useCallback(
    state => ({
      postableMaps: state.maps.postableMaps
    }),
    []
  );

  const { postableMaps } = useMappedState(mapState);

  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);

  const initPostableMaps = useCallback(async () => {
    const apiInstance = new MapsApi();
    const opts = {
      postable: true
    };

    apiInstance.mapsGet(opts, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchPostableMaps(response.body));
      } else {
        console.error(error);
      }
    });
  }, [dispatch]);

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
    if (defaultValue && postableMaps.length > 0) {
      const defaultMap = postableMaps.find(map => map.id === defaultValue);
      setValue(defaultMap);
      onChange(defaultMap);
    }
  }, [defaultValue, postableMaps]);

  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    const results = getMapPredictions(postableMaps, inputValue);

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

    return () => {
      active = false;
    };
  }, [value, inputValue, postableMaps]);

  useEffect(() => {
    initPostableMaps();
  }, []);

  return (
    <Autocomplete
      id="map-autocomplete"
      getOptionLabel={option => option.name}
      filterOptions={x => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      fullWidth
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      renderOption={option => {
        return (
          <MapAutocompleteOption option={option} inputValue={inputValue} />
        );
      }}
      renderInput={params => (
        <TextField
          {...params}
          label={I18n.t('map')}
          variant="outlined"
          margin="normal"
          required={required}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Map color="primary" />
              </InputAdornment>
            )
          }}
          data-test="map-select"
        />
      )}
    />
  );
});

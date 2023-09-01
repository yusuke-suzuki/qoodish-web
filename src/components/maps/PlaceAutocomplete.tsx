import { Search } from '@mui/icons-material';
import { InputAdornment, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import {
  MutableRefObject,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useState
} from 'react';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';

type Props = {
  onChange: (place: google.maps.places.Place) => void;
  label?: string;
};

const PlaceAutocomplete = forwardRef(function PlaceAutocomplete(
  { onChange, label }: Props,
  ref: MutableRefObject<HTMLInputElement>
) {
  const router = useRouter();
  const { loader } = useGoogleMapsApi();

  const [place, setPlace] = useState<google.maps.places.Place | null>(null);
  const [pac, setPac] = useState<google.maps.places.Autocomplete | null>(null);

  const initPac = useCallback(async () => {
    const { Autocomplete } = await loader.importLibrary('places');

    const autocomplete = new Autocomplete(ref.current, {
      fields: ['place_id', 'plus_code', 'name', 'formatted_address', 'geometry']
    });

    setPac(autocomplete);
  }, [loader, ref]);

  const handlePlaceChanged = useCallback(async () => {
    const placeResult = pac.getPlace();

    const { Place } = await loader.importLibrary('places');

    const place = new Place({
      id: placeResult.place_id,
      requestedLanguage: router.locale
    });

    const data = await place.fetchFields({
      fields: ['id', 'location', 'displayName', 'plusCode', 'formattedAddress']
    });

    setPlace(data.place);
  }, [pac, loader, router.locale]);

  useEffect(() => {
    if (!pac) {
      return;
    }

    pac.addListener('place_changed', handlePlaceChanged);
  }, [pac, handlePlaceChanged]);

  useEffect(() => {
    if (place) {
      onChange(place);
    }
  }, [place, onChange]);

  useEffect(() => {
    initPac();
  }, [initPac]);

  return (
    <TextField
      variant="outlined"
      fullWidth
      autoFocus
      type="search"
      size="small"
      inputProps={{
        ref: ref,
        placeholder: label
      }}
      InputProps={{
        margin: 'none',
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
        disableUnderline: true
      }}
    />
  );
});

export default memo(PlaceAutocomplete);

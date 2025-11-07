import { Search } from '@mui/icons-material';
import { InputAdornment, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import {
  type MutableRefObject,
  memo,
  useCallback,
  useEffect,
  useState
} from 'react';
import { useGoogleMap } from '../../hooks/useGoogleMap';

type Props = {
  ref: MutableRefObject<HTMLInputElement>;
  onChange: (place: google.maps.places.Place) => void;
  label?: string;
};

function PlaceAutocomplete({ ref, onChange, label }: Props) {
  const router = useRouter();

  const { loader } = useGoogleMap();

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
    if (!loader) {
      return;
    }

    initPac();
  }, [loader, initPac]);

  return (
    <TextField
      variant="outlined"
      fullWidth
      autoFocus
      type="search"
      size="small"
      slotProps={{
        input: {
          margin: 'none',
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          )
        },

        htmlInput: {
          ref: ref,
          placeholder: label
        }
      }}
    />
  );
}

export default memo(PlaceAutocomplete);

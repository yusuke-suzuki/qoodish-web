import { Search } from '@mui/icons-material';
import { InputAdornment, TextField } from '@mui/material';
import { useParams } from 'next/navigation';
import { type MutableRefObject, memo, useEffect, useState } from 'react';
import { useGoogleMap } from '../../hooks/useGoogleMap';

type Props = {
  ref: MutableRefObject<HTMLInputElement>;
  onChange: (place: google.maps.places.Place) => void;
  label?: string;
  autoFocus?: boolean;
};

function PlaceAutocomplete({ ref, onChange, label, autoFocus = true }: Props) {
  const { lang } = useParams<{ lang: string }>();

  const { loader } = useGoogleMap();

  const [place, setPlace] = useState<google.maps.places.Place | null>(null);
  const [pac, setPac] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!pac) {
      return;
    }

    const handlePlaceChanged = async () => {
      const placeResult = pac.getPlace();

      const { Place } = await loader.importLibrary('places');

      const place = new Place({
        id: placeResult.place_id,
        requestedLanguage: lang
      });

      const data = await place.fetchFields({
        fields: [
          'id',
          'location',
          'displayName',
          'plusCode',
          'formattedAddress'
        ]
      });

      setPlace(data.place);
    };

    pac.addListener('place_changed', handlePlaceChanged);
  }, [pac, loader, lang]);

  useEffect(() => {
    if (place) {
      onChange(place);
    }
  }, [place, onChange]);

  useEffect(() => {
    if (!loader) {
      return;
    }

    const initPac = async () => {
      const { Autocomplete } = await loader.importLibrary('places');

      const autocomplete = new Autocomplete(ref.current, {
        fields: [
          'place_id',
          'plus_code',
          'name',
          'formatted_address',
          'geometry'
        ]
      });

      setPac(autocomplete);
    };

    initPac();
  }, [loader, ref]);

  return (
    <TextField
      variant="outlined"
      fullWidth
      autoFocus={autoFocus}
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

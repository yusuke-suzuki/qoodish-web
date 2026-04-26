import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  type SlideProps
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useActionState, useCallback, useMemo, useState } from 'react';
import type { AppMap } from '../../../types';
import { createReview } from '../../actions/reviews';
import useDictionary from '../../hooks/useDictionary';
import uploadToStorage from '../../utils/uploadToStorage';
import AddPhotoButton from '../common/AddPhotoButton';
import PhotoPreviewList from '../common/PhotoPreviewList';
import PositionForm from '../maps/PositionForm';
import ReviewDescriptionForm from './ReviewDescriptionForm';
import ReviewNameForm from './ReviewNameForm';

function Transition({
  ref,
  ...props
}: SlideProps & { ref?: React.Ref<unknown> }) {
  return <Slide direction="up" ref={ref} {...props} />;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  onSaved: () => void;
  map: AppMap | null;
  place?: google.maps.places.Place | null;
  currentPosition?: GeolocationPosition | null;
  pinnedPosition?: google.maps.LatLng | null;
};

export default memo(function CreateReviewDialog({
  open,
  onClose,
  onExited,
  onSaved,
  map,
  place,
  currentPosition,
  pinnedPosition
}: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [dataUrls, setDataUrls] = useState<string[]>([]);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  const disabled = useMemo(() => {
    return !(name && comment && map && position);
  }, [name, comment, map, position]);

  const [, submitAction, isPending] = useActionState<null, FormData>(
    async (_prevState, _formData) => {
      if (!map || !position) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return null;
      }

      try {
        const photos = [];

        for (const dataUrl of dataUrls) {
          const fileName = `images/${self.crypto.randomUUID()}.jpg`;
          const url = await uploadToStorage(dataUrl, fileName, 'data_url');

          photos.push({ url: url });
        }

        const result = await createReview(map.id, {
          name,
          comment,
          latitude: position.lat,
          longitude: position.lng,
          images: photos
        });

        if (result.success) {
          enqueueSnackbar(dictionary['create review success'], {
            variant: 'success'
          });

          onClose();
          onSaved();
          return null;
        }

        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });
        return null;
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return null;
      }
    },
    null
  );

  const handleExited = useCallback(() => {
    setName(undefined);
    setComment(undefined);
    setDataUrls([]);
    setPosition(null);

    if (onExited) {
      onExited();
    }
  }, [onExited]);

  const handleImagesChange = useCallback((currentDataUrls: string[]) => {
    setDataUrls((prevState) => [...prevState, ...currentDataUrls]);
  }, []);

  const handleImageDelete = useCallback(
    (index) => {
      setDataUrls(
        dataUrls.filter((_dataUrl, i) => {
          return i !== index;
        })
      );
    },
    [dataUrls]
  );

  const defaultPositionFromPlace = useMemo(() => {
    if (!place) {
      return null;
    }

    return {
      lat: place.location.lat(),
      lng: place.location.lng()
    };
  }, [place]);

  const defaultPositionFromGeolocation = useMemo(() => {
    if (!currentPosition) {
      return null;
    }

    return {
      lat: currentPosition.coords.latitude,
      lng: currentPosition.coords.longitude
    };
  }, [currentPosition]);

  const defaultPositionFromPinnedPosition = useMemo(() => {
    if (!pinnedPosition) {
      return null;
    }

    return {
      lat: pinnedPosition.lat(),
      lng: pinnedPosition.lng()
    };
  }, [pinnedPosition]);

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      disableEscapeKeyDown
      fullWidth
      slots={{
        transition: Transition
      }}
      slotProps={{
        transition: { onExited: handleExited }
      }}
    >
      <form action={submitAction}>
        <DialogTitle>{dictionary['create new post']}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <PositionForm
              defaultValue={
                defaultPositionFromPlace ||
                defaultPositionFromGeolocation ||
                defaultPositionFromPinnedPosition
              }
              onChange={setPosition}
            />
          </Box>

          <ReviewNameForm
            defaultValue={place?.displayName}
            onChange={setName}
          />

          <ReviewDescriptionForm onChange={setComment} />

          <PhotoPreviewList dataUrls={dataUrls} onDelete={handleImageDelete} />
        </DialogContent>
        <DialogActions
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto'
          }}
        >
          <AddPhotoButton onChange={handleImagesChange} multiple />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Button
              type="button"
              onClick={onClose}
              disabled={isPending}
              color="inherit"
            >
              {dictionary.cancel}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={disabled}
              loading={isPending}
            >
              {dictionary.save}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
});

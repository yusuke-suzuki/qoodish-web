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
import {
  type FormEvent,
  memo,
  useCallback,
  useMemo,
  useState,
  useTransition
} from 'react';
import type { AppMap } from '../../../types';
import { createReview } from '../../actions/reviews';
import useDictionary from '../../hooks/useDictionary';
import uploadImage, { type UploadedImage } from '../../utils/uploadImage';
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
  const [items, setItems] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  const disabled = useMemo(() => {
    return !(name && comment && map && position) || isUploading;
  }, [name, comment, map, position, isUploading]);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!map || !position) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return;
      }

      startTransition(async () => {
        try {
          const result = await createReview(map.id, {
            name,
            comment,
            latitude: position.lat,
            longitude: position.lng,
            image_ids: items.map((item) => item.id)
          });

          if (result.success) {
            enqueueSnackbar(dictionary['create review success'], {
              variant: 'success'
            });

            onClose();
            onSaved();
            return;
          }

          enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
            variant: 'error'
          });
        } catch (_error) {
          enqueueSnackbar(dictionary['an error occurred'], {
            variant: 'error'
          });
        }
      });
    },
    [map, position, items, name, comment, dictionary, onClose, onSaved]
  );

  const handleExited = useCallback(() => {
    setName(undefined);
    setComment(undefined);
    setItems([]);
    setPosition(null);

    if (onExited) {
      onExited();
    }
  }, [onExited]);

  const handleImagesChange = useCallback(
    async (dataUrls: string[]) => {
      setIsUploading(true);
      try {
        for (const dataUrl of dataUrls) {
          const item = await uploadImage(dataUrl);
          setItems((prevState) => [...prevState, item]);
        }
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      } finally {
        setIsUploading(false);
      }
    },
    [dictionary]
  );

  const handleImageDelete = useCallback((index: number) => {
    setItems((prevState) => prevState.filter((_item, i) => i !== index));
  }, []);

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
      <form onSubmit={handleSubmit}>
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

          <PhotoPreviewList
            dataUrls={items.map((item) => item.url)}
            onDelete={handleImageDelete}
          />
        </DialogContent>
        <DialogActions
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto'
          }}
        >
          <AddPhotoButton
            onChange={handleImagesChange}
            multiple
            disabled={isUploading || isPending}
          />

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

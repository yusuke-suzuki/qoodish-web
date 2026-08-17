import { Box } from '@mui/material';
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
import usePhotoUploads from '../../hooks/usePhotoUploads';
import AddPhotoButton from '../common/AddPhotoButton';
import AppDialog from '../common/AppDialog';
import PhotoPreviewList from '../common/PhotoPreviewList';
import PositionForm from '../maps/PositionForm';
import ReviewDescriptionForm from './ReviewDescriptionForm';
import ReviewNameForm from './ReviewNameForm';

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
  const { items, isUploading, uploadedImages, upload, removeAt, reset } =
    usePhotoUploads();
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
            image_ids: uploadedImages.map((image) => image.id)
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
    [map, position, uploadedImages, name, comment, dictionary, onClose, onSaved]
  );

  const handleExited = useCallback(() => {
    setName(undefined);
    setComment(undefined);
    reset();
    setPosition(null);

    if (onExited) {
      onExited();
    }
  }, [onExited, reset]);

  const handleImagesChange = useCallback(
    async (dataUrls: string[]) => {
      try {
        await upload(dataUrls);
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    },
    [upload, dictionary]
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
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['create new post']}
      fullScreenOnMobile
      dividers
      disableQuickDismiss
      onSubmit={handleSubmit}
      onExited={handleExited}
      secondaryActions={
        <AddPhotoButton
          onChange={handleImagesChange}
          multiple
          disabled={isUploading || isPending}
        />
      }
      disableClose={isPending}
      confirmAction={{
        label: dictionary.save,
        type: 'submit',
        disabled,
        loading: isPending
      }}
    >
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

      <ReviewNameForm defaultValue={place?.displayName} onChange={setName} />

      <ReviewDescriptionForm onChange={setComment} />

      <PhotoPreviewList items={items} onDelete={removeAt} />
    </AppDialog>
  );
});

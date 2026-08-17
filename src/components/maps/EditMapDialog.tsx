import {
  Box,
  CardMedia,
  CircularProgress,
  Skeleton,
  Typography
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
import { updateMap } from '../../actions/maps';
import useDictionary from '../../hooks/useDictionary';
import usePhotoUploads from '../../hooks/usePhotoUploads';
import AddPhotoButton from '../common/AddPhotoButton';
import AppDialog from '../common/AppDialog';
import MapDescriptionForm from './MapDescriptionForm';
import MapNameForm from './MapNameForm';
import MapOptions from './MapOptions';
import PositionForm from './PositionForm';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (map: AppMap) => void;
  currentMap: AppMap | null;
};

export default memo(function EditMapDialog({
  open,
  onClose,
  onSaved,
  currentMap
}: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { items, isUploading, uploadedImages, upload, reset } =
    usePhotoUploads();
  const [isPrivate, setIsPrivate] = useState(false);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  const disabled = useMemo(() => {
    return !(name && description && position) || isUploading;
  }, [name, description, position, isUploading]);

  const previewItem = items[0];
  const newThumbnailUrl =
    previewItem?.status === 'uploading'
      ? previewItem.previewUrl
      : (previewItem?.image.card ?? null);
  const thumbnailUrl = newThumbnailUrl ?? currentMap?.image?.card ?? null;

  const handleImagesChange = useCallback(
    async (dataUrls: string[]) => {
      if (dataUrls.length < 1) {
        return;
      }
      reset();
      try {
        await upload([dataUrls[0]]);
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    },
    [reset, upload, dictionary]
  );

  const handleMapOptionsChange = useCallback(
    (options: {
      isPrivate: boolean;
    }) => {
      setIsPrivate(options.isPrivate);
    },
    []
  );

  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!currentMap || !position) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return;
      }

      startTransition(async () => {
        try {
          const result = await updateMap(currentMap.id, {
            name,
            description,
            latitude: position.lat,
            longitude: position.lng,
            private: isPrivate,
            image_ids:
              uploadedImages.length > 0
                ? uploadedImages.map((image) => image.id)
                : undefined
          });

          if (result.success) {
            enqueueSnackbar(dictionary['edit map success'], {
              variant: 'success'
            });

            onClose();
            onSaved(result.data);
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
    [
      currentMap,
      position,
      uploadedImages,
      name,
      description,
      isPrivate,
      dictionary,
      onClose,
      onSaved
    ]
  );

  const handleExited = useCallback(() => {
    setName(undefined);
    setDescription(undefined);
    reset();
    setPosition(null);
    setIsPrivate(false);
  }, [reset]);

  const defaultCenter = useMemo(() => {
    if (!currentMap) {
      return null;
    }

    return {
      lat: currentMap.latitude,
      lng: currentMap.longitude
    };
  }, [currentMap]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['edit map']}
      fullScreenOnMobile
      dividers
      disableQuickDismiss
      onSubmit={handleSubmit}
      onExited={handleExited}
      disableClose={isPending}
      confirmAction={{
        label: dictionary.save,
        type: 'submit',
        disabled,
        loading: isPending
      }}
    >
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {dictionary.thumbnail}
      </Typography>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="fit-content"
        position="relative"
        sx={{
          mb: 2
        }}
      >
        {thumbnailUrl ? (
          <CardMedia
            sx={{
              width: 160,
              height: 160,
              opacity: isUploading ? 0.4 : 1
            }}
            image={thumbnailUrl}
          />
        ) : (
          <Skeleton
            sx={{ width: 160, height: 160 }}
            variant="rectangular"
            animation={false}
          />
        )}

        <Box position="absolute">
          {isUploading ? (
            <CircularProgress />
          ) : (
            <AddPhotoButton
              onChange={handleImagesChange}
              color="inherit"
              disabled={isPending}
            />
          )}
        </Box>
      </Box>

      <MapNameForm onChange={setName} defaultValue={currentMap?.name} />
      <MapDescriptionForm
        onChange={setDescription}
        defaultValue={currentMap?.description}
      />

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {dictionary['center of map']}
      </Typography>

      <PositionForm onChange={setPosition} defaultValue={defaultCenter} />

      <Box>
        <MapOptions currentMap={currentMap} onChange={handleMapOptionsChange} />
      </Box>
    </AppDialog>
  );
});

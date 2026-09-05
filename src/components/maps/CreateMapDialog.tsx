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
import type { AppMap } from '../../../types/index.ts';
import { createMap } from '../../actions/maps.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import usePhotoUploads from '../../hooks/usePhotoUploads.ts';
import AddPhotoButton from '../common/AddPhotoButton.tsx';
import AppDialog from '../common/AppDialog.tsx';
import MapDescriptionForm from './MapDescriptionForm.tsx';
import MapNameForm from './MapNameForm.tsx';
import MapOptions from './MapOptions.tsx';
import PositionForm from './PositionForm.tsx';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (map: AppMap) => void;
};

export default memo(function CreateMapDialog({
  open,
  onClose,
  onSaved
}: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { items, isUploading, uploadedImages, upload, reset } =
    usePhotoUploads();

  const previewItem = items[0];
  const thumbnailUrl =
    previewItem?.status === 'uploading'
      ? previewItem.previewUrl
      : (previewItem?.image.card ?? null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  const disabled = useMemo(() => {
    return !(name && description && position) || isUploading;
  }, [name, description, position, isUploading]);

  const handleImagesChange = useCallback(
    async (files: File[]) => {
      if (files.length < 1) {
        return;
      }
      reset();
      try {
        await upload([files[0]]);
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    },
    [reset, upload, dictionary]
  );

  const handleMapOptionsChange = useCallback(
    (options: { isPrivate: boolean }) => {
      setIsPrivate(options.isPrivate);
    },
    []
  );

  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!position) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return;
      }

      startTransition(async () => {
        try {
          const result = await createMap({
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
            enqueueSnackbar(dictionary['create map success'], {
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
    return {
      lat: 0,
      lng: 0
    };
  }, []);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['create new map']}
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

      <MapNameForm onChange={setName} />
      <MapDescriptionForm onChange={setDescription} />

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {dictionary['center of map']}
      </Typography>

      <PositionForm onChange={setPosition} defaultValue={defaultCenter} />

      <Box>
        <MapOptions onChange={handleMapOptionsChange} />
      </Box>
    </AppDialog>
  );
});

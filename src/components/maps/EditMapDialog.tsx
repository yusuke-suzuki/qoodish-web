import {
  Box,
  Button,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Slide,
  type SlideProps,
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
import uploadImage, { type UploadedImage } from '../../utils/uploadImage';
import AddPhotoButton from '../common/AddPhotoButton';
import MapDescriptionForm from './MapDescriptionForm';
import MapNameForm from './MapNameForm';
import MapOptions from './MapOptions';
import PositionForm from './PositionForm';

function Transition({
  ref,
  ...props
}: SlideProps & { ref?: React.Ref<unknown> }) {
  return <Slide direction="up" ref={ref} {...props} />;
}

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
  const [newThumbnail, setNewThumbnail] = useState<UploadedImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  const disabled = useMemo(() => {
    return !(name && description && position) || isUploading;
  }, [name, description, position, isUploading]);

  const thumbnailUrl = newThumbnail?.url ?? currentMap?.image?.card ?? null;

  const handleImagesChange = useCallback(
    async (dataUrls: string[]) => {
      if (dataUrls.length < 1) {
        return;
      }
      setIsUploading(true);
      try {
        const uploaded = await uploadImage(dataUrls[0]);
        setNewThumbnail(uploaded);
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      } finally {
        setIsUploading(false);
      }
    },
    [dictionary]
  );

  const handleMapOptionsChange = useCallback(
    (options: {
      isPrivate: boolean;
      isShared: boolean;
    }) => {
      setIsPrivate(options.isPrivate);
      setIsShared(options.isShared);
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
            shared: isShared,
            image_ids: newThumbnail ? [newThumbnail.id] : undefined
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
      newThumbnail,
      name,
      description,
      isPrivate,
      isShared,
      dictionary,
      onClose,
      onSaved
    ]
  );

  const handleExited = useCallback(() => {
    setName(undefined);
    setDescription(undefined);
    setNewThumbnail(null);
    setPosition(null);
    setIsPrivate(false);
    setIsShared(false);
  }, []);

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
        <DialogTitle>{dictionary['edit map']}</DialogTitle>
        <DialogContent dividers>
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
                sx={{ width: 160, height: 160 }}
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
              <AddPhotoButton
                onChange={handleImagesChange}
                color="inherit"
                disabled={isUploading || isPending}
              />
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
            <MapOptions
              currentMap={currentMap}
              onChange={handleMapOptionsChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
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
        </DialogActions>
      </form>
    </Dialog>
  );
});

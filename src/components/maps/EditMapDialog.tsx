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
import { memo, useCallback, useMemo, useState, useTransition } from 'react';
import type { AppMap } from '../../../types';
import { updateMap } from '../../actions/maps';
import useDictionary from '../../hooks/useDictionary';
import uploadToStorage from '../../utils/uploadToStorage';
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

  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  const disabled = useMemo(() => {
    return !(name && description && position);
  }, [name, description, position]);

  const handleImagesChange = useCallback((currentDataUrls: string[]) => {
    if (currentDataUrls.length > 0) {
      setThumbnailDataUrl(currentDataUrls[0]);
    }
  }, []);

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

  const handleEditButtonClick = useCallback(() => {
    startTransition(async () => {
      try {
        let imageUrl: string | undefined;

        const url = thumbnailDataUrl ? new URL(thumbnailDataUrl) : null;

        if (url && url.protocol === 'data:') {
          const fileName = `maps/${self.crypto.randomUUID()}.jpg`;
          imageUrl = await uploadToStorage(
            thumbnailDataUrl,
            fileName,
            'data_url'
          );
        }

        const result = await updateMap(currentMap?.id, {
          name,
          description,
          latitude: position.lat,
          longitude: position.lng,
          private: isPrivate,
          shared: isShared,
          image_url: imageUrl
        });

        if (result.success) {
          enqueueSnackbar(dictionary['edit map success'], {
            variant: 'success'
          });

          onClose();
          onSaved(result.data);
        } else {
          enqueueSnackbar(result.error, { variant: 'error' });
        }
      } catch (error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    });
  }, [
    name,
    description,
    thumbnailDataUrl,
    position,
    isPrivate,
    isShared,
    currentMap,
    onClose,
    onSaved,
    dictionary
  ]);

  const handleExited = useCallback(() => {
    setName(undefined);
    setDescription(undefined);
    setThumbnailDataUrl(null);
    setPosition(null);
    setIsPrivate(false);
    setIsShared(false);
  }, []);

  const setCurrentThumbnail = useCallback(() => {
    if (!currentMap) {
      return;
    }

    setThumbnailDataUrl(currentMap.thumbnail_url);
  }, [currentMap]);

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
        transition: { onEnter: setCurrentThumbnail, onExited: handleExited }
      }}
    >
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
          {thumbnailDataUrl ? (
            <CardMedia
              sx={{ width: 160, height: 160 }}
              image={thumbnailDataUrl}
            />
          ) : (
            <Skeleton
              sx={{ width: 160, height: 160 }}
              variant="rectangular"
              animation={false}
            />
          )}

          <Box position="absolute">
            <AddPhotoButton onChange={handleImagesChange} color="inherit" />
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
        <Button onClick={onClose} disabled={isPending} color="inherit">
          {dictionary.cancel}
        </Button>
        <Button
          variant="contained"
          onClick={handleEditButtonClick}
          color="secondary"
          disabled={disabled}
          loading={isPending}
        >
          {dictionary.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

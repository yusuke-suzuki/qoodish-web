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
import { memo, useActionState, useCallback, useMemo, useState } from 'react';
import type { AppMap } from '../../../types';
import { createMap } from '../../actions/maps';
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
};

export default memo(function CreateMapDialog({
  open,
  onClose,
  onSaved
}: Props) {
  const dictionary = useDictionary();

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

  const [, submitAction, isPending] = useActionState<null, FormData>(
    async (_prevState, _formData) => {
      if (!position) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return null;
      }

      try {
        let imageUrl: string | undefined;

        if (thumbnailDataUrl) {
          const fileName = `maps/${self.crypto.randomUUID()}.jpg`;
          imageUrl = await uploadToStorage(
            thumbnailDataUrl,
            fileName,
            'data_url'
          );
        }

        const result = await createMap({
          name,
          description,
          latitude: position.lat,
          longitude: position.lng,
          private: isPrivate,
          shared: isShared,
          image_url: imageUrl
        });

        if (result.success) {
          enqueueSnackbar(dictionary['create map success'], {
            variant: 'success'
          });

          onClose();
          onSaved(result.data);
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
    setDescription(undefined);
    setThumbnailDataUrl(null);
    setPosition(null);
    setIsPrivate(false);
    setIsShared(false);
  }, []);

  const defaultCenter = useMemo(() => {
    return {
      lat: 0,
      lng: 0
    };
  }, []);

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
        <DialogTitle>{dictionary['create new map']}</DialogTitle>
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

          <MapNameForm onChange={setName} />
          <MapDescriptionForm onChange={setDescription} />

          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {dictionary['center of map']}
          </Typography>

          <PositionForm onChange={setPosition} defaultValue={defaultCenter} />

          <Box>
            <MapOptions onChange={handleMapOptionsChange} />
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

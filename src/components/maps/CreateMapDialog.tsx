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
import { createMap } from '../../actions/maps';
import useDictionary from '../../hooks/useDictionary';
import uploadImage from '../../utils/uploadImage';
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
          let imageId: number | undefined;

          if (thumbnailDataUrl) {
            imageId = await uploadImage(thumbnailDataUrl);
          }

          const result = await createMap({
            name,
            description,
            latitude: position.lat,
            longitude: position.lng,
            private: isPrivate,
            shared: isShared,
            image_ids: imageId ? [imageId] : undefined
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
      thumbnailDataUrl,
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
      <form onSubmit={handleSubmit}>
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

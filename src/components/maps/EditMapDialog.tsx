import { LoadingButton } from '@mui/lab';
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
  SlideProps,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  forwardRef,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import { AppMap } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import uploadToStorage from '../../utils/uploadToStorage';
import AddPhotoButton from '../common/AddPhotoButton';
import MapDescriptionForm from './MapDescriptionForm';
import MapNameForm from './MapNameForm';
import MapOptions from './MapOptions';
import PositionForm from './PositionForm';

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  const { currentUser } = useContext(AuthContext);
  const dictionary = useDictionary();

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const [loading, setLoading] = useState(false);
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

  const handleEditButtonClick = useCallback(async () => {
    setLoading(true);

    const params = {
      name: name,
      description: description,
      latitude: position.lat,
      longitude: position.lng,
      private: isPrivate,
      invitable: false,
      shared: isShared
    };

    const url = thumbnailDataUrl ? new URL(thumbnailDataUrl) : null;

    if (url && url.protocol === 'data:') {
      const fileName = `maps/${self.crypto.randomUUID()}.jpg`;
      const url = await uploadToStorage(thumbnailDataUrl, fileName, 'data_url');

      Object.assign(params, {
        image_url: url
      });
    }

    const token = await currentUser.getIdToken();

    const headers = new Headers({
      Accept: 'application/json',
      'Accept-Language': window.navigator.language,
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`
    });

    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/maps/${currentMap?.id}`,
      {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(params)
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        enqueueSnackbar(dictionary['edit map success'], { variant: 'success' });
        const body = await res.json();

        onClose();
        onSaved(body);
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occured'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [
    currentUser,
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
      fullScreen={!smUp}
      TransitionComponent={Transition}
      TransitionProps={{ onEnter: setCurrentThumbnail, onExited: handleExited }}
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
            <AddPhotoButton
              id="map-thumbnail-input"
              onChange={handleImagesChange}
              color="inherit"
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
        <Button onClick={onClose} disabled={loading} color="inherit">
          {dictionary.cancel}
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleEditButtonClick}
          color="secondary"
          disabled={disabled}
          loading={loading}
        >
          {dictionary.save}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

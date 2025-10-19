import { LoadingButton } from '@mui/lab';
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
  forwardRef,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import type { AppMap } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import uploadToStorage from '../../utils/uploadToStorage';
import AddPhotoButton from '../common/AddPhotoButton';
import PhotoPreviewList from '../common/PhotoPreviewList';
import PositionForm from '../maps/PositionForm';
import ReviewDescriptionForm from './ReviewDescriptionForm';
import ReviewNameForm from './ReviewNameForm';

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  const { currentUser } = useContext(AuthContext);
  const dictionary = useDictionary();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [dataUrls, setDataUrls] = useState<string[]>([]);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  const disabled = useMemo(() => {
    return !(name && comment && map && position);
  }, [name, comment, map, position]);

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

  const handleCreateButtonClick = useCallback(async () => {
    setLoading(true);

    const photos = [];

    for (const dataUrl of dataUrls) {
      const fileName = `images/${self.crypto.randomUUID()}.jpg`;
      const url = await uploadToStorage(dataUrl, fileName, 'data_url');

      photos.push({ url: url });
    }

    const params = {
      name: name,
      comment: comment,
      latitude: position.lat,
      longitude: position.lng,
      images: photos
    };

    const token = await currentUser.getIdToken();

    const headers = new Headers({
      Accept: 'application/json',
      'Accept-Language': window.navigator.language,
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`
    });

    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/maps/${map?.id}/reviews`,
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(params)
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        enqueueSnackbar(dictionary['create review success'], {
          variant: 'success'
        });

        onClose();
        onSaved();
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [
    currentUser,
    map,
    name,
    comment,
    position,
    dataUrls,
    onClose,
    onSaved,
    dictionary
  ]);

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
      TransitionComponent={Transition}
      TransitionProps={{ onExited: handleExited }}
    >
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

        <ReviewNameForm defaultValue={place?.displayName} onChange={setName} />

        <ReviewDescriptionForm onChange={setComment} />

        <PhotoPreviewList dataUrls={dataUrls} onDelete={handleImageDelete} />
      </DialogContent>

      <DialogActions
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto'
        }}
      >
        <AddPhotoButton
          id="review-image-input"
          onChange={handleImagesChange}
          multiple
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Button onClick={onClose} disabled={loading} color="inherit">
            {dictionary.cancel}
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleCreateButtonClick}
            color="secondary"
            disabled={disabled}
            loading={loading}
          >
            {dictionary.save}
          </LoadingButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
});

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  SlideProps
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
import { Review } from '../../../types';
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
  onSaved: () => void;
  currentReview: Review | null;
};

export default memo(function EditReviewDialog({
  open,
  onClose,
  onSaved,
  currentReview
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
    return !(name && comment && position);
  }, [name, comment, position]);

  const handleExited = useCallback(() => {
    setName(undefined);
    setComment(undefined);
    setDataUrls([]);
    setPosition(null);
  }, []);

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

  const handleSaveClick = useCallback(async () => {
    setLoading(true);

    const photos = [];

    for (const dataUrl of dataUrls) {
      const url = new URL(dataUrl);

      if (url.protocol === 'data:') {
        const fileName = `images/${self.crypto.randomUUID()}.jpg`;
        const url = await uploadToStorage(dataUrl, fileName, 'data_url');

        photos.push({ url: url });
      } else {
        // Do nothing
        photos.push({ url: dataUrl });
      }
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
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews/${currentReview?.id}`,
      {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(params)
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        enqueueSnackbar(dictionary['edit review success'], {
          variant: 'success'
        });

        onClose();
        onSaved();
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
    comment,
    dataUrls,
    currentReview,
    position,
    onClose,
    onSaved,
    dictionary
  ]);

  const setCurrentImages = useCallback(async () => {
    if (!currentReview) {
      return;
    }

    setDataUrls(currentReview.images.map((image) => image.url));
  }, [currentReview]);

  const defaultPosition = useMemo(() => {
    if (!currentReview) {
      return null;
    }

    return {
      lat: currentReview.latitude,
      lng: currentReview.longitude
    };
  }, [currentReview]);

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
      TransitionProps={{ onEnter: setCurrentImages, onExited: handleExited }}
    >
      <DialogTitle>{dictionary['edit post']}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <PositionForm onChange={setPosition} defaultValue={defaultPosition} />
        </Box>

        <ReviewNameForm defaultValue={currentReview?.name} onChange={setName} />

        <ReviewDescriptionForm
          defaultValue={currentReview?.comment}
          onChange={setComment}
        />

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
            onClick={handleSaveClick}
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

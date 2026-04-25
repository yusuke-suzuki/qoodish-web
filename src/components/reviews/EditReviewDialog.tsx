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
import { memo, useCallback, useMemo, useState, useTransition } from 'react';
import type { Review } from '../../../types';
import { updateReview } from '../../actions/reviews';
import useDictionary from '../../hooks/useDictionary';
import uploadToStorage from '../../utils/uploadToStorage';
import AddPhotoButton from '../common/AddPhotoButton';
import PhotoPreviewList from '../common/PhotoPreviewList';
import PositionForm from '../maps/PositionForm';
import ReviewDescriptionForm from './ReviewDescriptionForm';
import ReviewNameForm from './ReviewNameForm';

function Transition({
  ref,
  ...props
}: SlideProps & { ref?: React.Ref<unknown> }) {
  return <Slide direction="up" ref={ref} {...props} />;
}

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
  const dictionary = useDictionary();

  const [isPending, startTransition] = useTransition();
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

  const handleSaveClick = useCallback(() => {
    startTransition(async () => {
      try {
        const photos = [];

        for (const dataUrl of dataUrls) {
          const url = new URL(dataUrl);

          if (url.protocol === 'data:') {
            const fileName = `images/${self.crypto.randomUUID()}.jpg`;
            const url = await uploadToStorage(dataUrl, fileName, 'data_url');

            photos.push({ url: url });
          } else {
            photos.push({ url: dataUrl });
          }
        }

        const result = await updateReview(currentReview?.id, {
          name,
          comment,
          latitude: position.lat,
          longitude: position.lng,
          images: photos
        });

        if (result.success) {
          enqueueSnackbar(dictionary['edit review success'], {
            variant: 'success'
          });

          onClose();
          onSaved();
        } else {
          enqueueSnackbar(result.error, { variant: 'error' });
        }
      } catch (error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    });
  }, [
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
      slots={{
        transition: Transition
      }}
      slotProps={{
        transition: { onEnter: setCurrentImages, onExited: handleExited }
      }}
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
        <AddPhotoButton onChange={handleImagesChange} multiple />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Button onClick={onClose} disabled={isPending} color="inherit">
            {dictionary.cancel}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveClick}
            color="secondary"
            disabled={disabled}
            loading={isPending}
          >
            {dictionary.save}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
});

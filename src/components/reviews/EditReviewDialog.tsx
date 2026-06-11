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
  type FormEvent,
  memo,
  useCallback,
  useMemo,
  useState,
  useTransition
} from 'react';
import type { Review } from '../../../types';
import { updateReview } from '../../actions/reviews';
import useDictionary from '../../hooks/useDictionary';
import usePhotoUploads from '../../hooks/usePhotoUploads';
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

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const { items, isUploading, uploadedImages, upload, removeAt, reset } =
    usePhotoUploads();
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  const disabled = useMemo(() => {
    return !(name && comment && position) || isUploading;
  }, [name, comment, position, isUploading]);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!currentReview || !position) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return;
      }

      startTransition(async () => {
        try {
          const result = await updateReview(currentReview.id, {
            name,
            comment,
            latitude: position.lat,
            longitude: position.lng,
            image_ids: uploadedImages.map((image) => image.id)
          });

          if (result.success) {
            enqueueSnackbar(dictionary['edit review success'], {
              variant: 'success'
            });

            onClose();
            onSaved();
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
      currentReview,
      position,
      uploadedImages,
      name,
      comment,
      dictionary,
      onClose,
      onSaved
    ]
  );

  const handleExited = useCallback(() => {
    setName(undefined);
    setComment(undefined);
    reset();
    setPosition(null);
  }, [reset]);

  const handleImagesChange = useCallback(
    async (dataUrls: string[]) => {
      try {
        await upload(dataUrls);
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    },
    [upload, dictionary]
  );

  const setCurrentImages = useCallback(() => {
    if (!currentReview) {
      return;
    }

    reset(currentReview.images);
  }, [currentReview, reset]);

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
      <form onSubmit={handleSubmit}>
        <DialogTitle>{dictionary['edit post']}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <PositionForm
              onChange={setPosition}
              defaultValue={defaultPosition}
            />
          </Box>

          <ReviewNameForm
            defaultValue={currentReview?.name}
            onChange={setName}
          />

          <ReviewDescriptionForm
            defaultValue={currentReview?.comment}
            onChange={setComment}
          />

          <PhotoPreviewList items={items} onDelete={removeAt} />
        </DialogContent>
        <DialogActions
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto'
          }}
        >
          <AddPhotoButton
            onChange={handleImagesChange}
            multiple
            disabled={isUploading || isPending}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
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
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
});

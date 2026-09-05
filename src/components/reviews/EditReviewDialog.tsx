import { Box } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  type FormEvent,
  memo,
  useCallback,
  useMemo,
  useState,
  useTransition
} from 'react';
import type { Review } from '../../../types/index.ts';
import { updateReview } from '../../actions/reviews.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import usePhotoUploads from '../../hooks/usePhotoUploads.ts';
import AddPhotoButton from '../common/AddPhotoButton.tsx';
import AppDialog from '../common/AppDialog.tsx';
import PhotoPreviewList from '../common/PhotoPreviewList.tsx';
import PositionForm from '../maps/PositionForm.tsx';
import ReviewDescriptionForm from './ReviewDescriptionForm.tsx';
import ReviewNameForm from './ReviewNameForm.tsx';

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
    async (files: File[]) => {
      try {
        await upload(files);
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
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['edit post']}
      fullScreenOnMobile
      dividers
      disableQuickDismiss
      onSubmit={handleSubmit}
      onEnter={setCurrentImages}
      onExited={handleExited}
      secondaryActions={
        <AddPhotoButton
          onChange={handleImagesChange}
          multiple
          disabled={isUploading || isPending}
        />
      }
      disableClose={isPending}
      confirmAction={{
        label: dictionary.save,
        type: 'submit',
        disabled,
        loading: isPending
      }}
    >
      <Box sx={{ mb: 2 }}>
        <PositionForm onChange={setPosition} defaultValue={defaultPosition} />
      </Box>

      <ReviewNameForm defaultValue={currentReview?.name} onChange={setName} />

      <ReviewDescriptionForm
        defaultValue={currentReview?.comment}
        onChange={setComment}
      />

      <PhotoPreviewList items={items} onDelete={removeAt} />
    </AppDialog>
  );
});

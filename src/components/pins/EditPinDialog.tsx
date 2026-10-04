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
import type { AppMap, Pin, PinProperty } from '../../../types/index.ts';
import { updatePin } from '../../actions/pins.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import usePhotoUploads from '../../hooks/usePhotoUploads.ts';
import { offeredOptionIds } from '../../utils/pinPropertyOptions.ts';
import { uploadFailureMessage } from '../../utils/uploadImage.ts';
import AddPhotoButton from '../common/AddPhotoButton.tsx';
import AppDialog from '../common/AppDialog.tsx';
import PhotoPreviewList from '../common/PhotoPreviewList.tsx';
import PositionForm from '../maps/PositionForm.tsx';
import PinDescriptionForm from './PinDescriptionForm.tsx';
import PinNameForm from './PinNameForm.tsx';
import PinPropertyOptionsField from './PinPropertyOptionsField.tsx';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  currentPin: Pin | null;
  map: AppMap | null;
  pinProperties: PinProperty[];
};

export default memo(function EditPinDialog({
  open,
  onClose,
  onSaved,
  currentPin,
  map,
  pinProperties
}: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [optionIds, setOptionIds] = useState<number[]>([]);
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

      if (!currentPin || !position) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return;
      }

      startTransition(async () => {
        try {
          const result = await updatePin(currentPin.id, {
            name,
            comment,
            latitude: position.lat,
            longitude: position.lng,
            image_ids: uploadedImages.map((image) => image.id),
            property_option_ids: offeredOptionIds(pinProperties, optionIds)
          });

          if (result.success) {
            enqueueSnackbar(dictionary['edit pin success'], {
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
      currentPin,
      position,
      uploadedImages,
      name,
      comment,
      pinProperties,
      optionIds,
      dictionary,
      onClose,
      onSaved
    ]
  );

  const handleExited = useCallback(() => {
    setName('');
    setComment('');
    setOptionIds([]);
    reset();
    setPosition(null);
  }, [reset]);

  const handleImagesChange = useCallback(
    async (files: File[]) => {
      try {
        await upload(files);
      } catch (error) {
        enqueueSnackbar(uploadFailureMessage(error, dictionary), {
          variant: 'error'
        });
      }
    },
    [upload, dictionary]
  );

  const handleEnter = useCallback(() => {
    if (!currentPin) {
      return;
    }

    reset(currentPin.images);
    setOptionIds(
      offeredOptionIds(pinProperties, currentPin.property_option_ids)
    );
  }, [currentPin, pinProperties, reset]);

  const defaultLatitude = currentPin?.latitude;
  const defaultLongitude = currentPin?.longitude;

  const defaultPosition = useMemo(() => {
    if (defaultLatitude === undefined || defaultLongitude === undefined) {
      return null;
    }

    return {
      lat: defaultLatitude,
      lng: defaultLongitude
    };
  }, [defaultLatitude, defaultLongitude]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['edit post']}
      fullScreenOnMobile
      dividers
      disableQuickDismiss
      onSubmit={handleSubmit}
      onEnter={handleEnter}
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

      <PinNameForm defaultValue={currentPin?.name} onChange={setName} />

      <PinDescriptionForm
        defaultValue={currentPin?.comment}
        onChange={setComment}
      />

      <PinPropertyOptionsField
        map={map}
        pinProperties={pinProperties}
        value={optionIds}
        disabled={isPending}
        onChange={setOptionIds}
      />

      <PhotoPreviewList items={items} onDelete={removeAt} />
    </AppDialog>
  );
});

'use client';

import { AddPhotoAlternate, Close } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { type ChangeEvent, memo, useCallback, useId, useState } from 'react';
import type { Image, JourneyCheckin } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import fileToDataUrl from '../../utils/fileToDataUrl.ts';
import uploadImage from '../../utils/uploadImage.ts';

const IMAGE_SIZE = 96;

type Props = {
  checkin: JourneyCheckin;
  onAttach: (checkin: JourneyCheckin, image: Image) => Promise<void>;
  onRemove: (checkin: JourneyCheckin, imageId: number) => Promise<boolean>;
};

function CheckinImageStrip({ checkin, onAttach, onRemove }: Props) {
  const dictionary = useDictionary();

  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleFilesChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (files.length < 1) {
        return;
      }

      setUploading(true);

      try {
        for (const file of files) {
          const dataUrl = await fileToDataUrl(file);
          const image = await uploadImage(dataUrl);
          await onAttach(checkin, image);
        }
      } catch {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      } finally {
        setUploading(false);
      }
    },
    [checkin, onAttach, dictionary]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (pendingDelete === null) {
      return;
    }

    setDeleting(true);
    const success = await onRemove(checkin, pendingDelete);
    setDeleting(false);
    setPendingDelete(null);

    if (success) {
      enqueueSnackbar(dictionary['delete image success'], {
        variant: 'success'
      });
    }
  }, [checkin, pendingDelete, onRemove, dictionary]);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      {checkin.images.map((image) => (
        <Box key={image.id} sx={{ position: 'relative' }}>
          <Avatar
            variant="rounded"
            src={image.card}
            alt={checkin.spot.name}
            sx={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
          />
          <IconButton
            size="small"
            aria-label={dictionary.delete}
            onClick={() => setPendingDelete(image.id)}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              p: 0.25,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <Close sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ))}

      <input
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        id={inputId}
        type="file"
        onChange={handleFilesChange}
      />
      <label htmlFor={inputId}>
        <IconButton
          component="span"
          aria-label={dictionary['add images']}
          disabled={uploading}
          sx={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          {uploading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <AddPhotoAlternate fontSize="small" />
          )}
        </IconButton>
      </label>

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        maxWidth="xs"
      >
        <DialogTitle>{dictionary['sure to delete image']}</DialogTitle>
        <DialogActions>
          <Button color="inherit" onClick={() => setPendingDelete(null)}>
            {dictionary.cancel}
          </Button>
          <Button
            color="error"
            variant="contained"
            loading={deleting}
            onClick={handleConfirmDelete}
          >
            {dictionary.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default memo(CheckinImageStrip);

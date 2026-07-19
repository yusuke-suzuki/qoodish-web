'use client';

import { AddPhotoAlternate, Close } from '@mui/icons-material';
import { Avatar, Box, CircularProgress, IconButton } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { type ChangeEvent, memo, useCallback, useId, useState } from 'react';
import type { Image, JourneyCheckin } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import fileToDataUrl from '../../utils/fileToDataUrl';
import uploadImage from '../../utils/uploadImage';

type Props = {
  checkin: JourneyCheckin;
  onAttach: (checkin: JourneyCheckin, image: Image) => Promise<void>;
  onRemove: (checkin: JourneyCheckin, imageId: number) => Promise<void>;
};

function CheckinImageStrip({ checkin, onAttach, onRemove }: Props) {
  const dictionary = useDictionary();

  const inputId = useId();
  const [uploading, setUploading] = useState(false);

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

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      {checkin.images.map((image) => (
        <Box key={image.id} sx={{ position: 'relative' }}>
          <Avatar
            variant="rounded"
            src={image.avatar}
            alt={checkin.spot.name}
            sx={{ width: 48, height: 48 }}
          />
          <IconButton
            size="small"
            aria-label={dictionary.delete}
            onClick={() => onRemove(checkin, image.id)}
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
          aria-label={dictionary['add photos']}
          disabled={uploading}
          sx={{
            width: 48,
            height: 48,
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
    </Box>
  );
}

export default memo(CheckinImageStrip);

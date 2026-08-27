'use client';

import { AddPhotoAlternate, Delete } from '@mui/icons-material';
import {
  Box,
  ButtonBase,
  CardMedia,
  CircularProgress,
  IconButton,
  Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  type ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useState
} from 'react';
import type { ImageVariants } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import fileToDataUrl from '../../utils/fileToDataUrl.ts';
import uploadImage from '../../utils/uploadImage.ts';
import { coverAspectRatio } from './constants.ts';

type Props = {
  image: ImageVariants | null;
  editable: boolean;
  onChange?: (imageIds: number[]) => Promise<{ success: boolean }>;
  onSavingChange?: (saving: boolean) => void;
};

// Inset on the paper rather than full bleed: a tinted full-width block reads
// as the page background, leaving no sign that the card starts here.
const placeholderInsetSx = {
  px: { xs: 2.5, sm: 5 },
  pt: { xs: 2.5, sm: 5 }
} as const;

const placeholderSx = {
  width: '100%',
  aspectRatio: coverAspectRatio,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 1,
  border: '1px dashed',
  borderColor: 'divider'
} as const;

function ChapterCover({ image, editable, onChange, onSavingChange }: Props) {
  const dictionary = useDictionary();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    onSavingChange?.(saving);
  }, [saving, onSavingChange]);

  const handleInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file) {
        return;
      }

      setSaving(true);

      try {
        const uploaded = await uploadImage(await fileToDataUrl(file));
        await onChange?.([uploaded.id]);
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      } finally {
        setSaving(false);
      }
    },
    [onChange, dictionary]
  );

  const handleRemove = useCallback(async () => {
    setSaving(true);

    try {
      await onChange?.([]);
    } finally {
      setSaving(false);
    }
  }, [onChange]);

  if (image) {
    return (
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          image={image.ogp}
          alt=""
          sx={{
            width: '100%',
            aspectRatio: coverAspectRatio,
            objectFit: 'cover',
            opacity: saving ? 0.4 : 1
          }}
        />

        {editable && (
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            {saving ? (
              <CircularProgress size={24} />
            ) : (
              <IconButton
                size="small"
                aria-label={dictionary['remove cover']}
                onClick={handleRemove}
                sx={{ bgcolor: 'background.paper' }}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
    );
  }

  if (!editable) {
    return null;
  }

  if (saving) {
    return (
      <Box sx={placeholderInsetSx}>
        <Box sx={placeholderSx}>
          <CircularProgress size={28} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={placeholderInsetSx}>
      <ButtonBase
        component="label"
        sx={{
          ...placeholderSx,
          flexDirection: 'column',
          gap: 1,
          color: 'text.secondary',
          transition: (theme) => theme.transitions.create('background-color'),
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleInputChange}
        />
        <AddPhotoAlternate fontSize="large" />
        <Typography variant="body2">{dictionary['add cover']}</Typography>
      </ButtonBase>
    </Box>
  );
}

export default memo(ChapterCover);

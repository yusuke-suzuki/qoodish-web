'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import html2canvas from 'html2canvas';
import { enqueueSnackbar } from 'notistack';
import { type RefObject, useRef } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import { PHOTOS } from '../../utils/photos.ts';
import { HERO_SCRIM } from '../common/HeroBackground.tsx';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const ICON_SIZE = 512;

type Props = {
  lang: string;
  tagline: string;
};

export default function AssetGenerator({ lang, tagline }: Props) {
  const dictionary = useDictionary();
  const iconRef = useRef<HTMLDivElement>(null);
  const ogRef = useRef<HTMLDivElement>(null);

  const handleConvertToImage = async (
    ref: RefObject<HTMLDivElement>,
    name: string
  ) => {
    if (!ref.current) {
      return;
    }

    try {
      // The hero photograph comes from another origin, which taints the canvas
      // and makes toDataURL throw unless it is read through CORS.
      const canvas = await html2canvas(ref.current, { useCORS: true });
      const link = document.createElement('a');

      link.download = `${name}.webp`;
      link.href = canvas.toDataURL('image/webp');

      link.click();
    } catch {
      // A tainted canvas rejects at toDataURL, which would otherwise leave the
      // button looking like it did nothing at all.
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    }
  };

  return (
    <Stack spacing={5}>
      <Stack spacing={2} alignItems="flex-start">
        {/* Both assets are drawn at their delivered pixel size, which is wider
            than a phone: the preview scrolls rather than overflowing the page. */}
        <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Box
            ref={iconRef}
            sx={{
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              height: ICON_SIZE,
              width: ICON_SIZE
            }}
          >
            <Typography
              color="background.paper"
              sx={{
                fontFamily: 'var(--font-lobster), cursive',
                fontSize: 320,
                lineHeight: 1
              }}
            >
              Q
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={() => handleConvertToImage(iconRef, 'app-icon')}
        >
          Download
        </Button>
      </Stack>

      <Stack spacing={2} alignItems="flex-start">
        <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          {/* The card carries the landing hero's photograph and wash, so the
              image a link shows cannot drift from the page behind it. It does
              not reuse HeroBackground: that one crops a responsive source with
              object-fit, which html2canvas drops, and the export came out
              stretched. The host's ogp variant is already 1200x630, so there
              is nothing left to crop. */}
          <Box
            ref={ogRef}
            sx={{
              position: 'relative',
              display: 'grid',
              placeItems: 'center',
              width: OG_WIDTH,
              height: OG_HEIGHT
            }}
          >
            {/* Fetched through CORS so the entry this leaves in the cache is
                one html2canvas can read. Without it the preview's own no-cors
                response can be handed back to its request, and the canvas it
                draws into is tainted. */}
            <Box
              component="img"
              src={PHOTOS.fujiFromTheRidge.ogp}
              alt=""
              crossOrigin="anonymous"
              width={OG_WIDTH}
              height={OG_HEIGHT}
              sx={{ position: 'absolute', inset: 0 }}
            />

            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: HERO_SCRIM
              }}
            />

            <Stack
              spacing={3}
              sx={{ position: 'relative', px: 12, alignItems: 'center' }}
            >
              <Typography
                component="p"
                color="common.white"
                sx={{
                  fontFamily: 'var(--font-lobster), cursive',
                  fontSize: 148,
                  lineHeight: 1
                }}
              >
                Qoodish
              </Typography>

              <Typography
                variant="h3"
                component="p"
                color="common.white"
                sx={{ fontSize: 56, lineHeight: 1.4 }}
              >
                {tagline}
              </Typography>
            </Stack>
          </Box>
        </Box>

        {/* The export is uploaded to the image host, which assigns the id the
            pages are pointed at, so this name is the maintainer's bookkeeping
            rather than the one the card is served under. */}
        <Button
          variant="contained"
          onClick={() => handleConvertToImage(ogRef, `ogp-image-${lang}`)}
        >
          Download
        </Button>
      </Stack>
    </Stack>
  );
}

import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

const HERO_IMAGE_URL =
  'https://storage.googleapis.com/qoodish.appspot.com/assets/qoodish-lp-carousel-1-2019-05-06.jpg';

type Props = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

export default function HeroBackground({ children, sx }: Props) {
  return (
    <Box
      sx={[
        { position: 'relative', display: 'grid', placeItems: 'center' },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      <Box
        component="img"
        src={HERO_IMAGE_URL}
        alt=""
        // The hero is the largest paint on both pages it backs, so it is
        // fetched eagerly rather than left to the lazy default.
        loading="eager"
        fetchPriority="high"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />

      {/* Holds the text above the 4.5:1 contrast ratio wherever the photo is
          bright. */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(0, 0, 0, 0.45)'
        }}
      />

      <Box sx={{ position: 'relative', width: '100%' }}>{children}</Box>
    </Box>
  );
}

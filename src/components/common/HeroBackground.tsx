import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { Photo } from '../../utils/photos.ts';

// Holds the text above 4.5:1 wherever the photograph is bright. It is
// weighted to the ends because that is where the text sits; a wash even
// enough for both flattens the picture between them.
export const HERO_SCRIM =
  'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.45) 45%, rgba(0, 0, 0, 0.75) 100%)';

type Props = {
  children: ReactNode;
  photo: Photo;
  sx?: SxProps<Theme>;
};

export default function HeroBackground({ children, photo, sx }: Props) {
  return (
    <Box
      sx={[
        { position: 'relative', display: 'grid', placeItems: 'center' },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      <Box
        component="img"
        src={photo.src}
        srcSet={photo.srcSet}
        sizes="100vw"
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

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: HERO_SCRIM
        }}
      />

      <Box sx={{ position: 'relative', width: '100%' }}>{children}</Box>
    </Box>
  );
}

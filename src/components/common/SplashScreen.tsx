'use client';

import { keyframes } from '@emotion/react';
import { Box, Typography } from '@mui/material';
import { memo } from 'react';
import WalkingFootprints from './WalkingFootprints.tsx';

const appear = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

type Props = {
  // Required so the accessible name always comes from the dictionary.
  label: string;
};

// This component renders inside a server-rendered Suspense fallback,
// which React never hydrates — effects and state updates never run
// there. Everything must be static markup driven purely by CSS.
function SplashScreen({ label }: Props) {
  return (
    <Box
      component="output"
      aria-label={label}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100%',
        height: '100dvh',
        bgcolor: 'background.default',
        // Held back briefly so fast loads never flash the splash.
        opacity: 0,
        animation: `${appear} 0.4s ease-out 0.2s forwards`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          opacity: 1
        }
      }}
    >
      <Typography
        component="span"
        color="primary"
        sx={{
          fontFamily: 'var(--font-lobster), cursive',
          fontSize: { xs: '2.5rem', sm: '3rem' },
          lineHeight: 1.2
        }}
      >
        Qoodish
      </Typography>
      <Box sx={{ color: 'primary.main' }}>
        <WalkingFootprints size={16} />
      </Box>
    </Box>
  );
}

export default memo(SplashScreen);

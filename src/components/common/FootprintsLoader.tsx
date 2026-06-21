'use client';

import { keyframes } from '@emotion/react';
import { Box } from '@mui/material';
import { memo } from 'react';

const FOOTPRINT_COUNT = 5;
const STEP_DELAY = 0.18;

const step = keyframes`
  0%, 70%, 100% { opacity: 0.12; }
  35% { opacity: 1; }
`;

function Footprint({ flip }: { flip: boolean }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 32"
      aria-hidden
      sx={{
        width: 18,
        height: 24,
        fill: 'currentColor',
        transform: flip ? 'scaleX(-1) translateY(8px)' : 'translateY(-8px)'
      }}
    >
      <ellipse cx="12" cy="22" rx="7" ry="9" />
      <circle cx="6" cy="9" r="2.4" />
      <circle cx="11" cy="6" r="2.6" />
      <circle cx="16" cy="8" r="2.2" />
    </Box>
  );
}

type Props = {
  label?: string;
};

function FootprintsLoader({ label }: Props) {
  return (
    <Box
      component="output"
      aria-label={label ?? 'Loading'}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        color: 'primary.main'
      }}
    >
      {Array.from({ length: FOOTPRINT_COUNT }).map((_, index) => (
        <Box
          // biome-ignore lint/suspicious/noArrayIndexKey: static footprint trail
          key={`footprint-${index}`}
          sx={{
            display: 'inline-flex',
            animation: `${step} 1.4s ease-in-out infinite`,
            animationDelay: `${index * STEP_DELAY}s`,
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              opacity: 0.5
            }
          }}
        >
          <Footprint flip={index % 2 === 1} />
        </Box>
      ))}
    </Box>
  );
}

export default memo(FootprintsLoader);

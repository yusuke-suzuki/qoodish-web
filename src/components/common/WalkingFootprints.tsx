'use client';

import { keyframes } from '@emotion/react';
import { Box } from '@mui/material';
import { memo } from 'react';
import { FOOTPRINT_PATH_RIGHT } from '../../utils/journeyTrailIcons';

const STEP_DELAY = 0.18;

const step = keyframes`
  0%, 70%, 100% { opacity: 0.12; }
  35% { opacity: 1; }
`;

function Footprint({
  flip,
  size,
  shift
}: {
  flip: boolean;
  size: number;
  shift: number;
}) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 30"
      aria-hidden
      sx={{
        width: size,
        height: (size * 30) / 24,
        fill: 'currentColor',
        transform: flip
          ? `scaleX(-1) translateY(${shift}px)`
          : `translateY(${-shift}px)`
      }}
    >
      <path d={FOOTPRINT_PATH_RIGHT} />
    </Box>
  );
}

type Props = {
  count?: number;
  size?: number;
};

function WalkingFootprints({ count = 5, size = 18 }: Props) {
  const shift = count > 1 ? size * 0.44 : 0;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {Array.from({ length: count }).map((_, index) => (
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
          <Footprint flip={index % 2 === 1} size={size} shift={shift} />
        </Box>
      ))}
    </Box>
  );
}

export default memo(WalkingFootprints);

'use client';

import { keyframes } from '@emotion/react';
import { Box } from '@mui/material';
import { memo } from 'react';
import { FOOTPRINT_PATH_RIGHT } from '../../utils/journeyTrailIcons.ts';

const STEP_DELAY = 0.18;

const step = keyframes`
  0%, 70%, 100% { opacity: 0.12; }
  35% { opacity: 1; }
`;

// In a trail the prints walk to the right: toes rotate toward the travel
// direction, the right foot lands below the walking line and the left
// foot (mirrored across it) above. A single print stays upright for
// icon-like usage.
function Footprint({
  flip,
  size,
  shift,
  walking
}: {
  flip: boolean;
  size: number;
  shift: number;
  walking: boolean;
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
        transform: walking
          ? flip
            ? `translateY(${-shift}px) scaleY(-1) rotate(90deg)`
            : `translateY(${shift}px) rotate(90deg)`
          : undefined
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
  const walking = count > 1;
  const shift = walking ? size * 0.44 : 0;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: walking ? 1 : 0.5
      }}
    >
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
          <Footprint
            flip={index % 2 === 1}
            size={size}
            shift={shift}
            walking={walking}
          />
        </Box>
      ))}
    </Box>
  );
}

export default memo(WalkingFootprints);

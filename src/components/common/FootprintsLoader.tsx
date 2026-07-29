'use client';

import { keyframes } from '@emotion/react';
import { Box } from '@mui/material';
import { memo } from 'react';
import { FOOTPRINT_PATH_RIGHT } from '../../utils/journeyTrailIcons';

const VIEW_SIZE = 400;
const STEP_COUNT = 10;
const STEP_INTERVAL = 0.4;
const TRAIL_STAGGER_SECONDS = 2;
const HEAD_START_SECONDS = 1.5;
const FOOTSTEP_SECONDS = 3.6;
const FOOTSTEP_FADE_IN_SECONDS = 0.24;
const FOOTSTEP_HOLD_SECONDS = 2.24;
const STRIDE = 16;
const FOOT_SCALE = 1.4;
const REDUCED_MOTION_TRAILS = 4;

type Point = [number, number];

const WALK_PATTERNS: [Point, Point, Point, Point][] = [
  [
    [40, 220],
    [160, 80],
    [240, 320],
    [360, 180]
  ],
  [
    [60, 360],
    [180, 340],
    [140, 120],
    [340, 60]
  ],
  [
    [60, 60],
    [220, 100],
    [180, 260],
    [340, 340]
  ],
  [
    [40, 120],
    [200, 40],
    [160, 300],
    [360, 280]
  ],
  [
    [200, 380],
    [60, 260],
    [340, 140],
    [200, 20]
  ],
  [
    [40, 340],
    [360, 300],
    [60, 120],
    [340, 80]
  ],
  [
    [80, 320],
    [40, 60],
    [360, 40],
    [320, 320]
  ]
];

type TrailConfig = {
  pattern: number;
  mirrorX: boolean;
  mirrorY: boolean;
  reverse: boolean;
  top: number;
  left: number;
  width: number;
  height: number;
  rotation: number;
};

// This component renders inside a server-rendered Suspense fallback,
// which React never hydrates — effects and state updates never run
// there. Everything must be static markup driven purely by CSS.
const TRAILS: TrailConfig[] = [
  {
    pattern: 0,
    mirrorX: false,
    mirrorY: false,
    reverse: false,
    top: 2,
    left: 2,
    width: 62,
    height: 66,
    rotation: -10
  },
  {
    pattern: 4,
    mirrorX: true,
    mirrorY: false,
    reverse: false,
    top: 30,
    left: 36,
    width: 58,
    height: 64,
    rotation: 16
  },
  {
    pattern: 2,
    mirrorX: false,
    mirrorY: true,
    reverse: false,
    top: 4,
    left: 38,
    width: 60,
    height: 62,
    rotation: 6
  },
  {
    pattern: 6,
    mirrorX: false,
    mirrorY: false,
    reverse: true,
    top: 32,
    left: 2,
    width: 58,
    height: 66,
    rotation: -18
  },
  {
    pattern: 1,
    mirrorX: true,
    mirrorY: true,
    reverse: false,
    top: 0,
    left: 12,
    width: 56,
    height: 70,
    rotation: 12
  },
  {
    pattern: 5,
    mirrorX: false,
    mirrorY: false,
    reverse: false,
    top: 34,
    left: 30,
    width: 62,
    height: 60,
    rotation: -8
  },
  {
    pattern: 3,
    mirrorX: true,
    mirrorY: false,
    reverse: true,
    top: 6,
    left: 40,
    width: 56,
    height: 64,
    rotation: -14
  },
  {
    pattern: 4,
    mirrorX: false,
    mirrorY: true,
    reverse: true,
    top: 28,
    left: 6,
    width: 64,
    height: 62,
    rotation: 8
  }
];

const CYCLE_SECONDS = TRAILS.length * TRAIL_STAGGER_SECONDS;

const cyclePercent = (seconds: number) => (seconds / CYCLE_SECONDS) * 100;

const step = keyframes`
  0% { opacity: 0; }
  ${cyclePercent(FOOTSTEP_FADE_IN_SECONDS)}% { opacity: 0.9; }
  ${cyclePercent(FOOTSTEP_HOLD_SECONDS)}% { opacity: 0.9; }
  ${cyclePercent(FOOTSTEP_SECONDS)}%, 100% { opacity: 0; }
`;

function bezierPoint(controls: [Point, Point, Point, Point], t: number): Point {
  const [p0, p1, p2, p3] = controls;
  const u = 1 - t;
  const x =
    u * u * u * p0[0] +
    3 * u * u * t * p1[0] +
    3 * u * t * t * p2[0] +
    t * t * t * p3[0];
  const y =
    u * u * u * p0[1] +
    3 * u * u * t * p1[1] +
    3 * u * t * t * p2[1] +
    t * t * t * p3[1];

  return [x, y];
}

type Footstep = {
  x: number;
  y: number;
  rotation: number;
  flip: boolean;
};

function buildFootsteps(trail: TrailConfig): Footstep[] {
  const controls = WALK_PATTERNS[trail.pattern];

  const transform = ([x, y]: Point): Point => [
    trail.mirrorX ? VIEW_SIZE - x : x,
    trail.mirrorY ? VIEW_SIZE - y : y
  ];

  return Array.from({ length: STEP_COUNT }, (_, index) => {
    const progress = index / (STEP_COUNT - 1);
    const t = trail.reverse ? 1 - progress : progress;

    const point = transform(bezierPoint(controls, t));
    const ahead = transform(
      bezierPoint(
        controls,
        Math.min(Math.max(t + (trail.reverse ? -0.01 : 0.01), 0), 1)
      )
    );
    const behind = transform(
      bezierPoint(
        controls,
        Math.min(Math.max(t - (trail.reverse ? -0.01 : 0.01), 0), 1)
      )
    );

    const dx = ahead[0] - behind[0];
    const dy = ahead[1] - behind[1];
    const length = Math.hypot(dx, dy) || 1;

    const flip = index % 2 === 1;
    const side = flip ? -1 : 1;

    return {
      x: point[0] + ((-dy / length) * STRIDE * side) / 2,
      y: point[1] + ((dx / length) * STRIDE * side) / 2,
      rotation: (Math.atan2(dy, dx) * 180) / Math.PI + 90,
      flip
    };
  });
}

const TRAIL_FOOTSTEPS = TRAILS.map((trail) => buildFootsteps(trail));

type Props = {
  // Required so the accessible name always comes from the dictionary.
  label: string;
};

function FootprintsLoader({ label }: Props) {
  return (
    <Box
      component="output"
      aria-label={label}
      sx={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        color: 'primary.main'
      }}
    >
      {TRAILS.map((trail, trailIndex) => (
        <Box
          component="span"
          // biome-ignore lint/suspicious/noArrayIndexKey: static trail list
          key={`trail-${trailIndex}`}
          aria-hidden
          sx={{
            position: 'absolute',
            display: 'block',
            top: `${trail.top}%`,
            left: `${trail.left}%`,
            width: `${trail.width}%`,
            height: `${trail.height}%`,
            transform: `rotate(${trail.rotation}deg)`,
            '@media (prefers-reduced-motion: reduce)': {
              display: trailIndex < REDUCED_MOTION_TRAILS ? 'block' : 'none'
            }
          }}
        >
          <Box
            component="svg"
            viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
            preserveAspectRatio="xMidYMid meet"
            sx={{ display: 'block', width: '100%', height: '100%' }}
          >
            <g fill="currentColor">
              {TRAIL_FOOTSTEPS[trailIndex].map((footstep, index) => (
                <Box
                  component="g"
                  // biome-ignore lint/suspicious/noArrayIndexKey: static footstep trail
                  key={`footstep-${index}`}
                  transform={`translate(${footstep.x} ${footstep.y}) rotate(${footstep.rotation}) scale(${footstep.flip ? -FOOT_SCALE : FOOT_SCALE} ${FOOT_SCALE}) translate(-12 -15)`}
                  sx={{
                    opacity: 0,
                    animation: `${step} ${CYCLE_SECONDS}s linear infinite`,
                    animationDelay: `${trailIndex * TRAIL_STAGGER_SECONDS + index * STEP_INTERVAL - HEAD_START_SECONDS}s`,
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                      opacity: 0.5
                    }
                  }}
                >
                  <path d={FOOTPRINT_PATH_RIGHT} />
                </Box>
              ))}
            </g>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default memo(FootprintsLoader);

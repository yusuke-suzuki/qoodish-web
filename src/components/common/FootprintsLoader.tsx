'use client';

import { keyframes } from '@emotion/react';
import { Box } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import { FOOTPRINT_PATH_RIGHT } from '../../utils/journeyTrailIcons';

const VIEW_SIZE = 400;
const STEP_COUNT = 14;
const STEP_INTERVAL = 0.32;
const PAUSE_STEPS = 4;
const CYCLE_SECONDS = (STEP_COUNT + PAUSE_STEPS) * STEP_INTERVAL;
const STRIDE = 11;
const FOOT_SCALE = 0.85;

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
  ]
];

const step = keyframes`
  0% { opacity: 0; }
  4% { opacity: 0.9; }
  40% { opacity: 0.9; }
  70%, 100% { opacity: 0; }
`;

type Variant = {
  pattern: number;
  mirrorX: boolean;
  mirrorY: boolean;
  reverse: boolean;
};

function variantFromSeed(seed: number): Variant {
  const bucket = Math.floor(seed * WALK_PATTERNS.length * 8);

  return {
    pattern: bucket % WALK_PATTERNS.length,
    mirrorX: Boolean(bucket & 4),
    mirrorY: Boolean(bucket & 8),
    reverse: Boolean(bucket & 16)
  };
}

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

function buildFootsteps(variant: Variant): Footstep[] {
  const controls = WALK_PATTERNS[variant.pattern];

  const transform = ([x, y]: Point): Point => [
    variant.mirrorX ? VIEW_SIZE - x : x,
    variant.mirrorY ? VIEW_SIZE - y : y
  ];

  return Array.from({ length: STEP_COUNT }, (_, index) => {
    const progress = index / (STEP_COUNT - 1);
    const t = variant.reverse ? 1 - progress : progress;

    const point = transform(bezierPoint(controls, t));
    const ahead = transform(
      bezierPoint(
        controls,
        Math.min(Math.max(t + (variant.reverse ? -0.01 : 0.01), 0), 1)
      )
    );
    const behind = transform(
      bezierPoint(
        controls,
        Math.min(Math.max(t - (variant.reverse ? -0.01 : 0.01), 0), 1)
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

type Props = {
  // Required so the accessible name always comes from the dictionary.
  label: string;
};

function FootprintsLoader({ label }: Props) {
  const [cycle, setCycle] = useState(0);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeed(Math.random());
      setCycle((current) => current + 1);
    }, CYCLE_SECONDS * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const footsteps = buildFootsteps(variantFromSeed(seed));

  return (
    <Box
      component="output"
      aria-label={label}
      sx={{
        display: 'block',
        width: '100%',
        height: '100%',
        color: 'primary.main'
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        sx={{ display: 'block', width: '100%', height: '100%' }}
      >
        <g key={`cycle-${cycle}`} fill="currentColor">
          {footsteps.map((footstep, index) => (
            <Box
              component="g"
              // biome-ignore lint/suspicious/noArrayIndexKey: static footstep trail
              key={`footstep-${index}`}
              transform={`translate(${footstep.x} ${footstep.y}) rotate(${footstep.rotation}) scale(${footstep.flip ? -FOOT_SCALE : FOOT_SCALE} ${FOOT_SCALE}) translate(-12 -15)`}
              sx={{
                opacity: 0,
                animation: `${step} ${CYCLE_SECONDS}s linear infinite`,
                animationDelay: `${index * STEP_INTERVAL}s`,
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
  );
}

export default memo(FootprintsLoader);

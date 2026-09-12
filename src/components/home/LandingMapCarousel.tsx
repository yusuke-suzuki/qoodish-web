'use client';

import { styled } from '@mui/material/styles';
import { memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import MapCard from '../maps/MapCard.tsx';

// Written as CSS rather than through sx: the scroll marker properties are CSS
// Overflow 5 and have no entry in the style types yet. Where they are not
// implemented the rail is still a snapping scroller and simply has no dots, so
// there is no fallback here to keep in step.
const Rail = styled('ul')(
  ({ theme }) => `
  display: flex;
  gap: ${theme.spacing(3)};
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-marker-group: after;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  & > li {
    flex: 0 0 78%;
    scroll-snap-align: start;
  }

  ${theme.breakpoints.up('sm')} {
    & > li {
      flex-basis: 46%;
    }
  }

  ${theme.breakpoints.up('md')} {
    & > li {
      flex-basis: 31%;
    }
  }

  & > li::scroll-marker {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    /* A marker is a link to its item, and the user agent colours it as one;
       without this the dots come out browser blue on both bands. */
    color: inherit;
    background-color: currentColor;
    opacity: 0.3;
  }

  & > li::scroll-marker:target-current {
    opacity: 1;
  }

  &::scroll-marker-group {
    display: flex;
    justify-content: center;
    gap: ${theme.spacing(1)};
    margin-top: ${theme.spacing(3)};
  }
`
);

type Props = {
  maps: AppMap[];
  label: string;
};

export default memo(function LandingMapCarousel({ maps, label }: Props) {
  return (
    <Rail aria-label={label}>
      {maps.map((map) => (
        <li key={map.id}>
          <MapCard map={map} />
        </li>
      ))}
    </Rail>
  );
});

'use client';

import { Map as MapIcon } from '@mui/icons-material';
import { Avatar, Chip } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { AppMap } from '../../../types';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  map: AppMap | null;
  // Only read when the map is absent: a deleted map leaves no row behind,
  // while a private one is merely out of this reader's reach.
  mapDeleted?: boolean;
  locale: string;
};

function MapLinkChip({ map, mapDeleted, locale }: Props) {
  const dictionary = useDictionary();

  if (!map) {
    return (
      <Chip
        variant="outlined"
        avatar={
          <Avatar>
            <MapIcon fontSize="small" />
          </Avatar>
        }
        label={
          mapDeleted ? dictionary['deleted map'] : dictionary['private map']
        }
      />
    );
  }

  return (
    <Chip
      avatar={
        <Avatar src={map.image?.avatar} alt={map.name}>
          <MapIcon fontSize="small" />
        </Avatar>
      }
      label={map.name}
      component={Link}
      href={`/${locale}/maps/${map.id}`}
      clickable
    />
  );
}

export default memo(MapLinkChip);

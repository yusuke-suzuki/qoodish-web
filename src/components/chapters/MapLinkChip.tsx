'use client';

import { Map as MapIcon } from '@mui/icons-material';
import { Avatar, Chip } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { AppMap } from '../../../types';

type Props = {
  map: AppMap;
  locale: string;
};

function MapLinkChip({ map, locale }: Props) {
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

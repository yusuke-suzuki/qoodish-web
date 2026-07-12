'use client';

import { Map as MapIcon } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  Link as MuiLink,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { AppMap } from '../../../types';

type Props = {
  map: AppMap;
  locale: string;
};

function ChapterMapCard({ map, locale }: Props) {
  return (
    <Box sx={{ mt: 6 }}>
      <Divider sx={{ mb: 4 }} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          variant="rounded"
          src={map.image?.avatar}
          alt={map.name}
          sx={{ width: 56, height: 56 }}
        >
          <MapIcon />
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <MuiLink
            underline="hover"
            color="inherit"
            component={Link}
            href={`/${locale}/maps/${map.id}`}
            title={map.name}
          >
            <Typography variant="h6" component="p" noWrap>
              {map.name}
            </Typography>
          </MuiLink>

          {map.description && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {map.description}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default memo(ChapterMapCard);

'use client';

import { Lock, Map as MapIcon } from '@mui/icons-material';
import {
  Box,
  ButtonBase,
  Card,
  CardMedia,
  Chip,
  ImageListItemBar,
  Link as MuiLink,
  Paper,
  Skeleton,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { AppMap } from '../../../types';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  maps: AppMap[];
  skeletonSize?: number;
  cols?: number;
};

const tileImageHeight = 240;

function MapGridList({ maps, skeletonSize, cols }: Props) {
  const dictionary = useDictionary();

  const gridTemplateColumns = cols
    ? `repeat(${cols}, 1fr)`
    : { xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' };

  return (
    <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns }}>
      {(!maps.length ? Array.from(new Array(skeletonSize || 6)) : maps).map(
        (map: AppMap | null, i) => (
          <MuiLink
            href={map ? `/maps/${map.id}` : '/'}
            key={map ? map.id : i}
            underline={map ? 'hover' : 'none'}
            color="inherit"
            component={Link}
            title={map?.name}
          >
            <Box
              sx={{
                position: 'relative',
                height: tileImageHeight,
                overflow: 'hidden'
              }}
            >
              {!map && <Skeleton variant="rectangular" height="100%" />}

              {map?.thumbnail_url && (
                <Card sx={{ height: '100%' }} elevation={0}>
                  <ButtonBase>
                    <CardMedia
                      component="img"
                      image={map.thumbnail_url_800}
                      height="100%"
                      alt={map.name}
                      title={map.name}
                      loading="lazy"
                    />
                  </ButtonBase>
                </Card>
              )}

              {map && !map.thumbnail_url && (
                <Paper
                  sx={{
                    display: 'grid',
                    placeContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                  component={ButtonBase}
                  elevation={0}
                >
                  <MapIcon color="primary" fontSize="large" />
                </Paper>
              )}

              <ImageListItemBar
                position="top"
                actionIcon={
                  map?.private && (
                    <Chip
                      size="small"
                      icon={<Lock fontSize="small" />}
                      label={dictionary.private}
                      sx={{ m: 1 }}
                    />
                  )
                }
                sx={{
                  background: 'transparent'
                }}
              />
            </Box>

            <ImageListItemBar
              position="below"
              title={
                map ? (
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {map.name}
                  </Typography>
                ) : (
                  <Skeleton height={32} />
                )
              }
              subtitle={
                map ? (
                  <Typography variant="caption" color="text.secondary">
                    {map.owner.name}
                  </Typography>
                ) : (
                  <Skeleton width="60%" height={24} />
                )
              }
              sx={{ display: 'grid' }}
            />
          </MuiLink>
        )
      )}
    </Box>
  );
}

export default memo(MapGridList);

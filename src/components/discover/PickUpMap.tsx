'use client';

import {
  ButtonBase,
  Card,
  CardMedia,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Link as MuiLink,
  Skeleton,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { AppMap } from '../../../types';

type Props = {
  map: AppMap | null;
};

function PickUpMap({ map }: Props) {
  return (
    <ImageList cols={1} rowHeight={240} gap={0} sx={{ m: 0 }}>
      <MuiLink
        href={map ? `/maps/${map.id}` : '/'}
        key={map?.id}
        underline="none"
        component={Link}
        title={map?.name}
      >
        <ImageListItem>
          {!map && <Skeleton variant="rectangular" height="100%" />}

          {map && (
            <Card sx={{ height: '100%' }}>
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

          <ImageListItemBar
            position="bottom"
            title={
              <Typography
                sx={{ typography: { xs: 'h5', sm: 'h4' } }}
                color="inherit"
              >
                {map?.name}
              </Typography>
            }
            subtitle={
              <Typography
                sx={{ typography: { xs: 'subtitle2', sm: 'subtitle1' } }}
                color="inherit"
              >
                {map?.owner.name}
              </Typography>
            }
            sx={{
              height: '100%',
              borderRadius: '4px'
            }}
          />
        </ImageListItem>
      </MuiLink>
    </ImageList>
  );
}

export default memo(PickUpMap);

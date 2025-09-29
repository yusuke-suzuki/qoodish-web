import { Lock, Map as MapIcon } from '@mui/icons-material';
import {
  ButtonBase,
  Card,
  CardMedia,
  Chip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Link as MuiLink,
  Paper,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme
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

function MapGridList({ maps, skeletonSize, cols }: Props) {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const dictionary = useDictionary();

  return (
    <ImageList
      cols={cols || (smUp ? 3 : 1)}
      rowHeight={240}
      gap={8}
      sx={{ m: 0 }}
    >
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
            <ImageListItem>
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
            </ImageListItem>
          </MuiLink>
        )
      )}
    </ImageList>
  );
}

export default memo(MapGridList);

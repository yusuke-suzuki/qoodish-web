import {
  ButtonBase,
  Card,
  CardMedia,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Link as MuiLink,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import { usePublicMap } from '../../hooks/usePublicMap';

function PickUpMap() {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const { map } = usePublicMap(
    Number(process.env.NEXT_PUBLIC_PICKED_UP_MAP_ID)
  );

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
              <Typography variant={smUp ? 'h4' : 'h5'} color="inherit">
                {map?.name}
              </Typography>
            }
            subtitle={
              <Typography
                variant={smUp ? 'subtitle1' : 'subtitle2'}
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

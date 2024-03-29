import { DragHandle } from '@mui/icons-material';
import { Avatar, Box, CardHeader, Skeleton, SxProps } from '@mui/material';
import { ReactNode, memo } from 'react';
import { AppMap, Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import PrivateMapChip from './PrivateMapChip';

type Props = {
  map: AppMap | null;
  reviews: Review[];
  draggable?: boolean;
  action?: ReactNode;
  sx?: SxProps;
};

function MobileMiniMapHeader({ map, reviews, draggable, action, sx }: Props) {
  const dictionary = useDictionary();

  return (
    <>
      {draggable && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {<DragHandle fontSize="small" color="disabled" />}
        </Box>
      )}

      <CardHeader
        sx={sx}
        avatar={
          map ? (
            <Avatar
              alt={map.name}
              src={map.thumbnail_url_400}
              variant="rounded"
              sx={{ width: 64, height: 64 }}
            />
          ) : (
            <Skeleton variant="rounded" width={64} height={64} />
          )
        }
        title={map ? map.name : <Skeleton width="100%" />}
        titleTypographyProps={{
          variant: 'subtitle1',
          component: 'h1',
          fontWeight: 600,
          noWrap: true,
          width: 'calc(100dvw - 112px)'
        }}
        subheader={
          map ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {reviews.length} {dictionary['spots count']}

              {map.private && <PrivateMapChip />}
            </Box>
          ) : (
            <Skeleton width="50%" />
          )
        }
        subheaderTypographyProps={{
          variant: 'body2',
          component: 'div',
          noWrap: true,
          color: 'text.secondary',
          width: 'calc(100dvw - 112px)'
        }}
        action={action || null}
      />
    </>
  );
}

export default memo(MobileMiniMapHeader);

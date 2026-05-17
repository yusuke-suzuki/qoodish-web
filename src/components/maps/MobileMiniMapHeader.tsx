import { DragHandle, Lock } from '@mui/icons-material';
import { Avatar, Box, CardHeader, Skeleton, type SxProps } from '@mui/material';
import { type ReactNode, memo } from 'react';
import type { AppMap, Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';

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
        subheader={
          map ? (
            `${reviews.length} ${dictionary['spots count']}`
          ) : (
            <Skeleton width="50%" />
          )
        }
        action={
          action ??
          (map?.private ? (
            <Lock
              fontSize="small"
              color="action"
              titleAccess={dictionary.private}
            />
          ) : null)
        }
        slotProps={{
          root: {
            sx: { pt: 0 }
          },
          content: {
            sx: { minWidth: 0 }
          },
          title: {
            variant: 'subtitle1',
            component: 'h1',
            fontWeight: 600,
            noWrap: true
          },
          subheader: {
            variant: 'body2',
            component: 'div',
            noWrap: true,
            color: 'text.secondary'
          }
        }}
      />
    </>
  );
}

export default memo(MobileMiniMapHeader);

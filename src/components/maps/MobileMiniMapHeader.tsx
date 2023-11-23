import { DragHandle } from '@mui/icons-material';
import {
  Avatar,
  Box,
  CardHeader,
  Skeleton,
  SxProps,
  Typography
} from '@mui/material';
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
              sx={{ width: 80, height: 80 }}
            />
          ) : (
            <Skeleton variant="rounded" width={80} height={80} />
          )
        }
        title={
          map ? (
            <Typography variant="subtitle1" component="h1" fontWeight={600}>
              {map.name}
            </Typography>
          ) : (
            <Skeleton width="100%" />
          )
        }
        subheader={
          map ? (
            <>
              <Typography
                variant="body2"
                component="div"
                color="text.secondary"
                gutterBottom={map.private}
              >
                {reviews.length} {dictionary['spots count']}
              </Typography>

              {map.private && (
                <Box>
                  <PrivateMapChip />
                </Box>
              )}
            </>
          ) : (
            <Skeleton width="50%" />
          )
        }
        disableTypography
        action={action || null}
      />
    </>
  );
}

export default memo(MobileMiniMapHeader);

import { HistoryEdu } from '@mui/icons-material';
import { Avatar, Fab, Tooltip, Typography, useTheme } from '@mui/material';
import {
  MutableRefObject,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { Review } from '../../../types';
import { useGoogleMap } from '../../hooks/useGoogleMap';
import MarkerView from './MarkerView';

type Props = {
  review: Review;
  onClick: (review: Review, ref: MutableRefObject<HTMLButtonElement>) => void;
};

function ReviewMarker({ review, onClick }: Props) {
  const { loader } = useGoogleMap();

  const [position, setPosition] = useState<google.maps.LatLng | null>(null);

  const theme = useTheme();

  const ref = useRef<HTMLButtonElement | null>(null);

  const [open, setOpen] = useState(false);

  const updatePosition = useCallback(async () => {
    if (!loader) {
      return;
    }

    const { LatLng } = await loader.importLibrary('core');

    setPosition(new LatLng(review.latitude, review.longitude));
  }, [loader, review]);

  const handleClick = useCallback(() => {
    onClick(review, ref);
  }, [review, onClick]);

  const handleTooltipClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleTooltipOpen = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!loader) {
      return;
    }

    updatePosition();
  }, [loader, updatePosition]);

  if (!position) {
    return null;
  }

  return (
    <MarkerView
      position={position}
      onMouseEnter={handleTooltipOpen}
      onMouseLeave={handleTooltipClose}
      onClick={handleClick}
    >
      <Tooltip
        title={
          <Typography noWrap variant="subtitle2">
            {review.name}
          </Typography>
        }
        open={open}
        PopperProps={{
          disablePortal: true
        }}
        arrow
      >
        <Fab
          size="small"
          sx={{
            bgcolor: 'background.paper'
          }}
          ref={ref}
        >
          {review.images.length > 0 ? (
            <Avatar
              src={review.images[0].thumbnail_url}
              imgProps={{
                alt: review.name,
                loading: 'lazy'
              }}
              sx={{
                width: theme.spacing(4),
                height: theme.spacing(4),
                bgcolor: 'transparent'
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: theme.spacing(4),
                height: theme.spacing(4),
                bgcolor: 'transparent'
              }}
            >
              <HistoryEdu color="primary" />
            </Avatar>
          )}
        </Fab>
      </Tooltip>
    </MarkerView>
  );
}

export default memo(ReviewMarker);

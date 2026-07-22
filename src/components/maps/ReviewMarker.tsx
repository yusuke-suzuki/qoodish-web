import { Check, Flag, HistoryEdu } from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Fab,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  type MutableRefObject,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import type { Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import { useGoogleMap } from '../../hooks/useGoogleMap';
import MarkerView from './MarkerView';

type Props = {
  review: Review;
  milestone?: 'planned' | 'visited';
  onClick: (review: Review, ref: MutableRefObject<HTMLButtonElement>) => void;
};

function ReviewMarker({ review, milestone, onClick }: Props) {
  const { loader } = useGoogleMap();
  const dictionary = useDictionary();

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

  const avatar =
    review.images.length > 0 ? (
      <Avatar
        src={review.images[0].avatar}
        sx={{
          width: theme.spacing(4),
          height: theme.spacing(4),
          bgcolor: 'transparent'
        }}
        slotProps={{
          img: {
            alt: review.name,
            loading: 'lazy'
          }
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
    );

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
        arrow
        slotProps={{
          popper: {
            disablePortal: true
          }
        }}
      >
        <Fab
          size="small"
          sx={{
            bgcolor: 'background.paper'
          }}
          ref={ref}
          aria-label={
            milestone
              ? `${review.name} — ${dictionary[`${milestone} milestone`]}`
              : review.name
          }
        >
          {milestone === undefined ? (
            avatar
          ) : (
            <Badge
              badgeContent={
                milestone === 'visited' ? (
                  <Check sx={{ fontSize: 12 }} />
                ) : (
                  <Flag sx={{ fontSize: 12 }} />
                )
              }
              color={milestone === 'visited' ? 'success' : 'primary'}
              overlap="circular"
              sx={{
                '& .MuiBadge-badge': {
                  border: '2px solid',
                  borderColor: 'background.paper'
                }
              }}
            >
              {avatar}
            </Badge>
          )}
        </Fab>
      </Tooltip>
    </MarkerView>
  );
}

export default memo(ReviewMarker);

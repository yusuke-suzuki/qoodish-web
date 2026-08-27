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
  useEffect,
  useRef,
  useState
} from 'react';
import type { Review } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';
import MarkerView from './MarkerView.tsx';

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

  const handleClick = () => {
    onClick(review, ref);
  };

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (!loader) {
      return;
    }

    let cancelled = false;

    const updatePosition = async () => {
      const { LatLng } = await loader.importLibrary('core');

      if (cancelled) {
        return;
      }

      setPosition(new LatLng(review.latitude, review.longitude));
    };

    updatePosition();

    return () => {
      cancelled = true;
    };
  }, [loader, review.latitude, review.longitude]);

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

import { Add, MyLocation } from '@mui/icons-material';
import {
  Badge,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Fab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
  styled
} from '@mui/material';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Profile } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import { useGoogleMap } from '../../hooks/useGoogleMap';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';
import ProfileAvatar from '../common/ProfileAvatar';
import MarkerView from './MarkerView';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""'
    }
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0
    }
  }
}));

type Props = {
  profile: Profile | null;
  onCreateReviewClick: () => void;
  disableCreateReview: boolean;
};

function CurrentPositionMarker({
  profile,
  onCreateReviewClick,
  disableCreateReview
}: Props) {
  const { loader } = useGoogleMapsApi();
  const { currentPosition } = useGoogleMap();

  const dictionary = useDictionary();

  const [position, setPosition] = useState<google.maps.LatLng | null>(null);
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLButtonElement | null>(null);

  const [popoverAnchorEl, setPopoverAnchorEl] =
    useState<HTMLButtonElement | null>(null);

  const handlePopoverOpen = useCallback(() => {
    setPopoverAnchorEl(ref.current);
  }, []);

  const handlePopoverClose = useCallback(() => {
    setPopoverAnchorEl(null);
  }, []);

  const handleTooltipClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleTooltipOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCreateReviewClick = useCallback(() => {
    setPopoverAnchorEl(null);

    onCreateReviewClick();
  }, [onCreateReviewClick]);

  const popoverOpen = Boolean(popoverAnchorEl);

  const popoverId = useMemo(() => {
    return popoverOpen ? 'current-position' : undefined;
  }, [popoverOpen]);

  const initPosition = useCallback(async () => {
    if (!loader || !currentPosition) {
      return;
    }

    const { LatLng } = await loader.importLibrary('core');

    setPosition(
      new LatLng(
        currentPosition.coords.latitude,
        currentPosition.coords.longitude
      )
    );
  }, [loader, currentPosition]);

  useEffect(() => {
    if (!loader) {
      return;
    }

    initPosition();
  }, [loader, initPosition]);

  if (!position) {
    return null;
  }

  return (
    <>
      <MarkerView
        position={position}
        onClick={handlePopoverOpen}
        onMouseEnter={handleTooltipOpen}
        onMouseLeave={handleTooltipClose}
      >
        <Tooltip
          title={
            <Typography noWrap variant="subtitle2">
              {dictionary['current position']}
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
              bgcolor: 'secondary.light'
            }}
            ref={ref}
          >
            <StyledBadge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              variant="dot"
            >
              <ProfileAvatar profile={profile} size={32} />
            </StyledBadge>
          </Fab>
        </Tooltip>
      </MarkerView>

      <Popover
        id={popoverId}
        open={popoverOpen}
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        slotProps={{
          paper: {
            sx: {
              width: {
                xs: 240,
                sm: 320
              }
            }
          }
        }}
        disableScrollLock
      >
        <CardHeader
          avatar={
            <ProfileAvatar profile={profile} size={64} variant="rounded" />
          }
          title={profile?.name}
          subheader={profile?.biography}
          titleTypographyProps={{
            fontWeight: 600
          }}
        />
        <Divider />
        <CardContent>
          <List disablePadding>
            <ListItem disablePadding>
              <ListItemIcon>
                <MyLocation />
              </ListItemIcon>
              <ListItemText
                secondary={`${position.lat()}, ${position.lng()}`}
              />
            </ListItem>
          </List>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            size="small"
            disabled={disableCreateReview}
            onClick={handleCreateReviewClick}
            startIcon={<Add />}
          >
            {dictionary['add new spot']}
          </Button>
        </CardActions>
      </Popover>
    </>
  );
}

export default memo(CurrentPositionMarker);

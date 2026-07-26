'use client';

import {
  Check,
  CheckCircle,
  Delete,
  DirectionsWalk,
  MoreVert,
  Pause,
  Place,
  PlayArrow
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  SwipeableDrawer,
  Typography
} from '@mui/material';
import { useParams } from 'next/navigation';
import { memo, useCallback, useMemo, useState } from 'react';
import type {
  Image,
  Journey,
  JourneyCheckin,
  Milestone,
  Review,
  Spot
} from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import useLocalDateTime from '../../hooks/useLocalDateTime';
import DrawerPuller from '../common/DrawerPuller';
import CheckinImageStrip from './CheckinImageStrip';
import CheckinNoteField from './CheckinNoteField';

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit'
};

type TimelineItem = {
  key: string;
  spot: Spot;
  image: string | undefined;
  checkin: JourneyCheckin | undefined;
  reviewId: number;
  milestone: Milestone | undefined;
};

type RowProps = {
  item: TimelineItem;
  timeLabel: string | null;
  onRemove: () => void;
  onAttachImage: (checkin: JourneyCheckin, image: Image) => Promise<void>;
  onRemoveImage: (checkin: JourneyCheckin, imageId: number) => Promise<boolean>;
  onSaveNote: (checkin: JourneyCheckin, note: string | null) => Promise<void>;
};

function TimelineRow({
  item,
  timeLabel,
  onRemove,
  onAttachImage,
  onRemoveImage,
  onSaveNote
}: RowProps) {
  const dictionary = useDictionary();
  const visited = Boolean(item.checkin);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const closeMenu = useCallback(() => setMenuAnchor(null), []);

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            visited ? (
              <CheckCircle
                color="success"
                sx={{
                  fontSize: 16,
                  bgcolor: 'background.paper',
                  borderRadius: '50%'
                }}
              />
            ) : null
          }
        >
          <Avatar
            variant="rounded"
            src={item.image}
            alt={item.spot.name}
            sx={{ width: 36, height: 36 }}
          >
            <Place fontSize="small" />
          </Avatar>
        </Badge>
        <Box
          sx={{
            width: 2,
            flex: 1,
            bgcolor: 'divider',
            mt: 0.5,
            minHeight: 16
          }}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, pb: 2 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 36 }}
        >
          <Typography
            variant="subtitle1"
            component="h4"
            fontWeight={700}
            noWrap
            sx={{ flex: 1, minWidth: 0 }}
          >
            {item.spot.name}
          </Typography>
          {timeLabel && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {timeLabel}
            </Typography>
          )}
          <IconButton
            size="small"
            aria-label={dictionary.more}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {item.checkin && (
          <>
            <Box sx={{ mb: 1 }}>
              <CheckinNoteField checkin={item.checkin} onSave={onSaveNote} />
            </Box>

            <Box sx={{ mt: 1, mb: 0.5 }}>
              <CheckinImageStrip
                checkin={item.checkin}
                onAttach={onAttachImage}
                onRemove={onRemoveImage}
              />
            </Box>
          </>
        )}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        <MenuItem
          onClick={() => {
            onRemove();
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary.delete} />
        </MenuItem>
      </Menu>
    </Box>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  journey: Journey | null;
  reviews: Review[];
  paused: boolean;
  onRemoveMilestone: (milestone: Milestone) => void;
  onRemoveCheckin: (checkin: JourneyCheckin) => void;
  onAttachImage: (checkin: JourneyCheckin, image: Image) => Promise<void>;
  onRemoveImage: (checkin: JourneyCheckin, imageId: number) => Promise<boolean>;
  onSaveNote: (checkin: JourneyCheckin, note: string | null) => Promise<void>;
  onStartClick: () => void;
  onPauseClick: () => void;
  onResumeClick: () => void | Promise<void>;
  onEndClick: () => void;
};

function JourneyProgressSheet({
  open,
  onClose,
  onOpen,
  journey,
  reviews,
  paused,
  onRemoveMilestone,
  onRemoveCheckin,
  onAttachImage,
  onRemoveImage,
  onSaveNote,
  onStartClick,
  onPauseClick,
  onResumeClick,
  onEndClick
}: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();
  const formatLocal = useLocalDateTime();

  const imagesByReview = useMemo(() => {
    return new Map(
      reviews.map((review) => [review.id, review.images[0]?.avatar])
    );
  }, [reviews]);

  const checkinsByReview = useMemo(() => {
    const map = new Map<number, JourneyCheckin>();

    for (const checkin of journey?.checkins ?? []) {
      map.set(checkin.review_id, checkin);
    }

    return map;
  }, [journey]);

  const plannedItems = useMemo<TimelineItem[]>(
    () =>
      (journey?.milestones ?? []).map((milestone: Milestone) => ({
        key: `milestone-${milestone.id}`,
        spot: {
          name: milestone.name,
          latitude: milestone.latitude,
          longitude: milestone.longitude
        },
        image: imagesByReview.get(milestone.review_id),
        checkin: checkinsByReview.get(milestone.review_id),
        reviewId: milestone.review_id,
        milestone
      })),
    [journey, checkinsByReview, imagesByReview]
  );

  const extraItems = useMemo<TimelineItem[]>(() => {
    const plannedReviewIds = new Set(plannedItems.map((item) => item.reviewId));

    return (journey?.checkins ?? [])
      .filter((checkin) => !plannedReviewIds.has(checkin.review_id))
      .map((checkin) => ({
        key: `checkin-${checkin.id}`,
        spot: checkin.spot,
        image: imagesByReview.get(checkin.review_id),
        checkin,
        reviewId: checkin.review_id,
        milestone: undefined
      }));
  }, [journey, plannedItems, imagesByReview]);

  const items = useMemo(
    () => [...plannedItems, ...extraItems],
    [plannedItems, extraItems]
  );

  const visitedCount = plannedItems.filter((item) => item.checkin).length;
  const progress =
    plannedItems.length > 0 ? (visitedCount / plannedItems.length) * 100 : 0;

  const [resuming, setResuming] = useState(false);

  const handleRecordingToggle = useCallback(async () => {
    if (!paused) {
      onPauseClick();
      return;
    }

    setResuming(true);

    try {
      await onResumeClick();
    } finally {
      setResuming(false);
    }
  }, [paused, onPauseClick, onResumeClick]);

  const handleRemoveItem = useCallback(
    (item: TimelineItem) => {
      if (item.milestone) {
        onRemoveMilestone(item.milestone);
      }

      if (item.checkin) {
        onRemoveCheckin(item.checkin);
      }
    },
    [onRemoveMilestone, onRemoveCheckin]
  );

  const formatTime = (value: string) => formatLocal(value, TIME_OPTIONS);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '75svh',
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
    >
      <DrawerPuller />

      <Box sx={{ flexShrink: 0, px: 2, pb: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between'
          }}
        >
          <Typography
            variant="subtitle1"
            component="h2"
            fontWeight={600}
            noWrap
          >
            {dictionary.milestones}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {visitedCount} / {plannedItems.length}
          </Typography>
        </Box>

        {plannedItems.length > 0 && (
          <LinearProgress
            variant="determinate"
            value={progress}
            color="success"
            sx={{ mt: 1, height: 8, borderRadius: 4 }}
          />
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2 }}>
        {items.map((item) => (
          <TimelineRow
            key={item.key}
            item={item}
            timeLabel={
              item.checkin ? formatTime(item.checkin.checked_in_at) : null
            }
            onRemove={() => handleRemoveItem(item)}
            onAttachImage={onAttachImage}
            onRemoveImage={onRemoveImage}
            onSaveNote={onSaveNote}
          />
        ))}
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          pt: 1.5,
          pb: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        {journey?.started_at ? (
          <Stack spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              loading={resuming}
              startIcon={paused ? <PlayArrow /> : <Pause />}
              onClick={handleRecordingToggle}
            >
              {paused
                ? dictionary['resume journey recording']
                : dictionary['pause journey recording']}
            </Button>
            <Button
              fullWidth
              disableElevation
              variant="contained"
              color="success"
              startIcon={<Check />}
              onClick={onEndClick}
            >
              {dictionary['end journey']}
            </Button>
          </Stack>
        ) : (
          <Button
            fullWidth
            disableElevation
            variant="contained"
            color="secondary"
            startIcon={<DirectionsWalk />}
            onClick={onStartClick}
          >
            {dictionary['start journey']}
          </Button>
        )}
      </Box>
    </SwipeableDrawer>
  );
}

export default memo(JourneyProgressSheet);

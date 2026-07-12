'use client';

import {
  Check,
  CheckCircle,
  Delete,
  MoreVert,
  Place
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import { useParams } from 'next/navigation';
import { memo, useCallback, useMemo, useState } from 'react';
import type {
  Journey,
  JourneyCheckin,
  Milestone,
  Review,
  Spot
} from '../../../types';
import useDictionary from '../../hooks/useDictionary';

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
};

function TimelineRow({ item, timeLabel, onRemove }: RowProps) {
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
            variant="subtitle2"
            component="h4"
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
            aria-label={dictionary.edit}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
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
  journey: Journey | null;
  reviews: Review[];
  onRemoveMilestone: (milestone: Milestone) => void;
  onRemoveCheckin: (checkin: JourneyCheckin) => void;
  onEndClick: () => void;
};

function JourneyProgressSheet({
  open,
  onClose,
  journey,
  reviews,
  onRemoveMilestone,
  onRemoveCheckin,
  onEndClick
}: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

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

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString(lang, {
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '75dvh'
          }
        }
      }}
    >
      <Box sx={{ p: 2, pb: 3, overflowY: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            mb: 2
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

        {items.map((item) => (
          <TimelineRow
            key={item.key}
            item={item}
            timeLabel={
              item.checkin ? formatTime(item.checkin.checked_in_at) : null
            }
            onRemove={() => handleRemoveItem(item)}
          />
        ))}

        <Button
          fullWidth
          variant="contained"
          color="success"
          startIcon={<Check />}
          onClick={onEndClick}
          sx={{ mt: 1 }}
        >
          {dictionary['end journey']}
        </Button>
      </Box>
    </Drawer>
  );
}

export default memo(JourneyProgressSheet);

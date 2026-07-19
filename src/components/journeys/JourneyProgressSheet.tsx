'use client';

import {
  AddPhotoAlternate,
  Check,
  CheckCircle,
  Close,
  Delete,
  MoreVert,
  Place
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import {
  type ChangeEvent,
  memo,
  useCallback,
  useId,
  useMemo,
  useState
} from 'react';
import type {
  Image,
  Journey,
  JourneyCheckin,
  Milestone,
  Review,
  Spot
} from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import type { CheckinImages } from '../../utils/checkinImageStorage';
import fileToDataUrl from '../../utils/fileToDataUrl';
import uploadImage from '../../utils/uploadImage';

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
  images: Image[];
  onRemove: () => void;
  onAttachImage: (checkin: JourneyCheckin, image: Image) => void;
  onRemoveImage: (checkin: JourneyCheckin, imageId: number) => void;
};

function TimelineRow({
  item,
  timeLabel,
  images,
  onRemove,
  onAttachImage,
  onRemoveImage
}: RowProps) {
  const dictionary = useDictionary();
  const visited = Boolean(item.checkin);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const closeMenu = useCallback(() => setMenuAnchor(null), []);

  const imageInputId = useId();
  const [uploading, setUploading] = useState(false);

  const handleImageFilesChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';

      const checkin = item.checkin;

      if (files.length < 1 || !checkin) {
        return;
      }

      setUploading(true);

      try {
        for (const file of files) {
          const dataUrl = await fileToDataUrl(file);
          const image = await uploadImage(dataUrl);
          onAttachImage(checkin, image);
        }
      } catch {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      } finally {
        setUploading(false);
      }
    },
    [item.checkin, onAttachImage, dictionary]
  );

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

        {item.checkin && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              mt: 1,
              mb: 0.5
            }}
          >
            {images.map((image) => (
              <Box key={image.id} sx={{ position: 'relative' }}>
                <Avatar
                  variant="rounded"
                  src={image.avatar}
                  alt={item.spot.name}
                  sx={{ width: 48, height: 48 }}
                />
                <IconButton
                  size="small"
                  aria-label={dictionary.delete}
                  onClick={() => {
                    if (item.checkin) {
                      onRemoveImage(item.checkin, image.id);
                    }
                  }}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    p: 0.25,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}

            <input
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              id={imageInputId}
              type="file"
              onChange={handleImageFilesChange}
            />
            <label htmlFor={imageInputId}>
              <IconButton
                component="span"
                aria-label={dictionary['add photos']}
                disabled={uploading}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                {uploading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AddPhotoAlternate fontSize="small" />
                )}
              </IconButton>
            </label>
          </Box>
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
  journey: Journey | null;
  reviews: Review[];
  checkinImages: CheckinImages;
  onRemoveMilestone: (milestone: Milestone) => void;
  onRemoveCheckin: (checkin: JourneyCheckin) => void;
  onAttachImage: (checkin: JourneyCheckin, image: Image) => void;
  onRemoveImage: (checkin: JourneyCheckin, imageId: number) => void;
  onEndClick: () => void;
};

function JourneyProgressSheet({
  open,
  onClose,
  journey,
  reviews,
  checkinImages,
  onRemoveMilestone,
  onRemoveCheckin,
  onAttachImage,
  onRemoveImage,
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
            images={item.checkin ? (checkinImages[item.checkin.id] ?? []) : []}
            onRemove={() => handleRemoveItem(item)}
            onAttachImage={onAttachImage}
            onRemoveImage={onRemoveImage}
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

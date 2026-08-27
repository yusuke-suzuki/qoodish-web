'use client';

import {
  AddLocationAlt,
  Check,
  CheckCircle,
  ChevronRight,
  Delete,
  DirectionsWalk,
  HistoryEdu,
  MoreVert,
  Place,
  RadioButtonUnchecked
} from '@mui/icons-material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  timelineItemClasses
} from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import type {
  AppMap,
  Chapter,
  Image,
  Journey,
  JourneyCheckin,
  Review
} from '../../../types/index.ts';
import { createChapter } from '../../actions/chapters.ts';
import {
  addCheckin,
  deleteJourney,
  finishJourney,
  removeCheckin,
  updateCheckin
} from '../../actions/journeys.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalDateTime, {
  LOCAL_DATE_TIME_PLACEHOLDER
} from '../../hooks/useLocalDateTime.ts';
import { createChapterContent } from '../../utils/chapterContent.ts';
import { trailDistanceMeters } from '../../utils/geo.ts';
import { deletePaused } from '../../utils/journeyPauseStorage.ts';
import { deleteTrail, loadTrail } from '../../utils/journeyTrailStorage.ts';
import { createMapFeatures } from '../../utils/mapFeatures.ts';
import { decodePath, encodePath } from '../../utils/polyline.ts';
import MapLinkChip from '../chapters/MapLinkChip.tsx';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog.tsx';
import NoContents from '../common/NoContents.tsx';
import CheckinImageStrip from './CheckinImageStrip.tsx';
import CheckinNoteField from './CheckinNoteField.tsx';
import EndJourneyDialog from './EndJourneyDialog.tsx';
import JourneyMap from './JourneyMap.tsx';
import SpotPickerDialog from './SpotPickerDialog.tsx';

const DAY_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit'
};

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
};

function toDatetimeLocal(value: string): string {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type Props = {
  journey: Journey;
  chapter: Chapter | null;
  // Deleting a map nullifies the journeys on it, so the journey outlives it.
  map: AppMap | null;
  reviews: Review[];
};

export default function JourneyDetailView({
  journey,
  chapter,
  map,
  reviews
}: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();
  const formatLocal = useLocalDateTime();
  const router = useRouter();
  const { uid } = useContext(AuthContext);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  // router.refresh() cannot be awaited, so the journey prop still reads as
  // unfinished for a moment after the request succeeds.
  const [ended, setEnded] = useState(false);
  const [recording, setRecording] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingReview, setPendingReview] = useState<Review | null>(null);
  const [pendingTime, setPendingTime] = useState('');
  const [addingCheckin, setAddingCheckin] = useState(false);
  const [pendingDeleteCheckin, setPendingDeleteCheckin] =
    useState<JourneyCheckin | null>(null);

  const [checkins, setCheckins] = useState(journey.checkins);
  const checkinsRef = useRef(journey.checkins);

  const trail = useMemo(
    () => decodePath(journey.encoded_path),
    [journey.encoded_path]
  );

  const sortedCheckins = useMemo(
    () =>
      checkins.toSorted((a, b) =>
        a.checked_in_at.localeCompare(b.checked_in_at)
      ),
    [checkins]
  );

  const checkinSpots = useMemo(
    () => checkins.map((checkin) => checkin.spot),
    [checkins]
  );

  const mapCenter = useMemo(
    () =>
      map ? { latitude: map.latitude, longitude: map.longitude } : undefined,
    [map]
  );

  const milestones = useMemo(() => {
    const visitedReviewIds = new Set(
      checkins.map((checkin) => checkin.review_id)
    );

    return journey.milestones.map((milestone) => ({
      id: milestone.id,
      name: milestone.name,
      latitude: milestone.latitude,
      longitude: milestone.longitude,
      visited: visitedReviewIds.has(milestone.review_id)
    }));
  }, [journey.milestones, checkins]);

  // A reached milestone already has a check-in pin at the same place.
  const pendingMilestones = useMemo(
    () => milestones.filter((milestone) => !milestone.visited),
    [milestones]
  );

  const visitedMilestones = milestones.length - pendingMilestones.length;

  const milestoneProgress =
    milestones.length > 0 ? (visitedMilestones / milestones.length) * 100 : 0;

  const saveCheckin = useCallback(
    async (
      checkin: JourneyCheckin,
      params: { image_ids?: number[]; note?: string | null }
    ): Promise<boolean> => {
      const { success, data, error } = await updateCheckin(
        journey.id,
        checkin.id,
        params
      );

      if (!success || !data) {
        enqueueSnackbar(error ?? dictionary['an error occurred'], {
          variant: 'error'
        });
        return false;
      }

      checkinsRef.current = checkinsRef.current.map((existing) =>
        existing.id === data.id ? data : existing
      );
      setCheckins(checkinsRef.current);
      return true;
    },
    [journey.id, dictionary]
  );

  const handleAttachImage = useCallback(
    async (checkin: JourneyCheckin, image: Image) => {
      const latest =
        checkinsRef.current.find((existing) => existing.id === checkin.id) ??
        checkin;

      await saveCheckin(checkin, {
        image_ids: [...latest.images.map((existing) => existing.id), image.id]
      });
    },
    [saveCheckin]
  );

  const handleRemoveImage = useCallback(
    (checkin: JourneyCheckin, imageId: number): Promise<boolean> => {
      const latest =
        checkinsRef.current.find((existing) => existing.id === checkin.id) ??
        checkin;

      return saveCheckin(checkin, {
        image_ids: latest.images
          .filter((existing) => existing.id !== imageId)
          .map((existing) => existing.id)
      });
    },
    [saveCheckin]
  );

  const handleSaveNote = useCallback(
    (checkin: JourneyCheckin, note: string | null): Promise<boolean> => {
      return saveCheckin(checkin, { note });
    },
    [saveCheckin]
  );

  const usedReviewIds = useMemo(
    () => new Set(checkins.map((checkin) => checkin.review_id)),
    [checkins]
  );

  const handleSelectReview = useCallback(
    (review: Review) => {
      setPickerOpen(false);
      setPendingReview(review);

      const last = checkinsRef.current.at(-1);
      const seed =
        last?.checked_in_at ??
        journey.finished_at ??
        journey.started_at ??
        new Date().toISOString();

      setPendingTime(toDatetimeLocal(seed));
    },
    [journey.finished_at, journey.started_at]
  );

  const timeRange = useMemo(
    () => ({
      min: journey.started_at ? toDatetimeLocal(journey.started_at) : undefined,
      max: journey.finished_at
        ? toDatetimeLocal(journey.finished_at)
        : toDatetimeLocal(new Date().toISOString())
    }),
    [journey.started_at, journey.finished_at]
  );

  const pendingTimeValid =
    Boolean(pendingTime) &&
    (!timeRange.min || pendingTime >= timeRange.min) &&
    pendingTime <= timeRange.max;

  const handleConfirmCheckin = useCallback(async () => {
    if (!pendingReview) {
      return;
    }

    setAddingCheckin(true);

    const { success, data, error } = await addCheckin(
      journey.id,
      pendingReview.id,
      new Date(pendingTime).toISOString()
    );

    setAddingCheckin(false);

    if (!success || !data) {
      enqueueSnackbar(error ?? dictionary['an error occurred'], {
        variant: 'error'
      });
      return;
    }

    checkinsRef.current = [...checkinsRef.current, data];
    setCheckins(checkinsRef.current);
    setPendingReview(null);
  }, [journey.id, pendingReview, pendingTime, dictionary]);

  const handleRemoveCheckin = useCallback(async () => {
    if (!pendingDeleteCheckin) {
      return;
    }

    const { success, error } = await removeCheckin(
      journey.id,
      pendingDeleteCheckin.id
    );

    if (!success) {
      enqueueSnackbar(error ?? dictionary['an error occurred'], {
        variant: 'error'
      });
      return;
    }

    checkinsRef.current = checkinsRef.current.filter(
      (existing) => existing.id !== pendingDeleteCheckin.id
    );
    setCheckins(checkinsRef.current);
    setPendingDeleteCheckin(null);
  }, [journey.id, pendingDeleteCheckin, dictionary]);

  const trailKm = useMemo(() => {
    const meters = trailDistanceMeters(trail);
    return meters > 0 ? (meters / 1000).toFixed(1) : null;
  }, [trail]);

  const started = Boolean(journey.started_at);
  const active = started && !journey.finished_at && !ended;

  // The trail is only ever held in this browser until the journey is finished,
  // so ending from another device stamps the finish without one.
  const handleEnd = useCallback(async () => {
    const { success, error } = await finishJourney(
      journey.id,
      uid ? encodePath(loadTrail(uid, journey.id)) : ''
    );

    if (!success) {
      enqueueSnackbar(error ?? dictionary['an error occurred'], {
        variant: 'error'
      });
      return;
    }

    if (uid) {
      deleteTrail(uid, journey.id);
      deletePaused(uid, journey.id);
    }

    setEnded(true);
    setEndOpen(false);
    router.refresh();
  }, [journey.id, uid, dictionary, router]);

  const handleRecord = useCallback(async () => {
    if (!map) {
      return;
    }

    setRecording(true);

    const { success, data, error } = await createChapter(map.id, {
      title: dictionary['untitled chapter'],
      content: createChapterContent({ ...journey, checkins }),
      map_features: createMapFeatures({ ...journey, checkins }),
      journey_id: journey.id
    });

    if (!success || !data) {
      enqueueSnackbar(error ?? dictionary['an error occurred'], {
        variant: 'error'
      });
      setRecording(false);
      return;
    }

    router.push(`/${lang}/chapters/${data.id}/edit`);
  }, [map, journey, checkins, router, lang, dictionary]);

  const handleDeleteConfirm = useCallback(async () => {
    const { success } = await deleteJourney(journey.id);

    if (!success) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      return;
    }

    enqueueSnackbar(dictionary['delete journey success'], {
      variant: 'success'
    });
    setDeleteOpen(false);
    router.push(`/${lang}/journeys`);
  }, [journey.id, dictionary, router, lang]);

  const formatDay = (value: string) => formatLocal(value, DAY_OPTIONS);

  const formatTime = (value: string) => formatLocal(value, TIME_OPTIONS);

  const formatDateTime = (value: string) =>
    formatLocal(value, DATE_TIME_OPTIONS);

  const startFormatted = journey.started_at
    ? formatDateTime(journey.started_at)
    : null;
  const finishFormatted = journey.finished_at
    ? formatDateTime(journey.finished_at)
    : null;
  const dateRangeText =
    startFormatted === LOCAL_DATE_TIME_PLACEHOLDER &&
    finishFormatted === LOCAL_DATE_TIME_PLACEHOLDER
      ? LOCAL_DATE_TIME_PLACEHOLDER
      : [startFormatted, finishFormatted].filter(Boolean).join(' – ');

  return (
    <>
      <Paper elevation={0} sx={{ overflow: 'hidden' }}>
        <JourneyMap
          spots={checkinSpots}
          milestones={pendingMilestones}
          path={trail}
          locale={lang}
          fallbackCenter={mapCenter}
          height={{ xs: 260, sm: 320 }}
        />

        <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <MapLinkChip
                map={map}
                mapDeleted={journey.map_id === null}
                locale={lang}
              />
            </Box>
            <IconButton
              size="small"
              aria-label={dictionary.more}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" component="h2">
              {journey.started_at
                ? formatDay(journey.started_at)
                : dictionary['untitled journey']}
            </Typography>
            {active && (
              <Chip
                size="small"
                color="primary"
                label={dictionary['in progress']}
              />
            )}
            {!started && <Chip size="small" label={dictionary.planned} />}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {dateRangeText}
          </Typography>

          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            spacing={2}
          >
            <Stack justifyContent="center">
              <Typography variant="h6" fontWeight="bold" align="center">
                {sortedCheckins.length}
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                align="center"
              >
                {dictionary.checkins}
              </Typography>
            </Stack>

            {trailKm && (
              <Stack justifyContent="center">
                <Typography variant="h6" fontWeight="bold" align="center">
                  {trailKm}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  align="center"
                >
                  {dictionary.km}
                </Typography>
              </Stack>
            )}
          </Stack>

          {milestones.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  mb: 1
                }}
              >
                <Typography variant="subtitle2" component="h3">
                  {dictionary.milestones}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {visitedMilestones} / {milestones.length}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={milestoneProgress}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />

              <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                {milestones.map((milestone) => (
                  <Box
                    key={milestone.id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    {milestone.visited ? (
                      <CheckCircle color="success" fontSize="small" />
                    ) : (
                      <RadioButtonUnchecked color="disabled" fontSize="small" />
                    )}
                    <Typography
                      variant="body2"
                      color={
                        milestone.visited ? 'text.primary' : 'text.secondary'
                      }
                      noWrap
                    >
                      {milestone.name}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {sortedCheckins.length < 1 ? (
            <NoContents icon={Place} message={dictionary['no checkins']} />
          ) : (
            <Timeline
              sx={{
                p: 0,
                [`& .${timelineItemClasses.root}:before`]: {
                  flex: 0,
                  padding: 0
                }
              }}
            >
              {sortedCheckins.map((checkin, index) => (
                <TimelineItem key={checkin.id}>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <Place fontSize="small" />
                    </TimelineDot>
                    {index < sortedCheckins.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          component="h3"
                          fontWeight={700}
                        >
                          {checkin.spot.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {formatTime(checkin.checked_in_at)}
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        aria-label={dictionary.delete}
                        onClick={() => setPendingDeleteCheckin(checkin)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box sx={{ mt: 0.5 }}>
                      <CheckinNoteField
                        checkin={checkin}
                        onSave={handleSaveNote}
                      />
                    </Box>

                    <Box sx={{ mt: 1 }}>
                      <CheckinImageStrip
                        checkin={checkin}
                        onAttach={handleAttachImage}
                        onRemove={handleRemoveImage}
                      />
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}

          {started && map && reviews.length > 0 && (
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<AddLocationAlt />}
              onClick={() => setPickerOpen(true)}
              sx={{ mt: sortedCheckins.length < 1 ? 3 : 1 }}
            >
              {dictionary['add checkin']}
            </Button>
          )}

          {active && (
            <Button
              fullWidth
              disableElevation
              variant="contained"
              color="success"
              startIcon={<Check />}
              onClick={() => setEndOpen(true)}
              sx={{ mt: 1 }}
            >
              {dictionary['end journey']}
            </Button>
          )}

          {/* Starting has to happen where the trail is recorded, so this only
              carries the reader to the map. */}
          {!started && map && (
            <Button
              fullWidth
              disableElevation
              variant="contained"
              color="secondary"
              startIcon={<DirectionsWalk />}
              component={Link}
              href={`/${lang}/maps/${map.id}`}
              sx={{ mt: 3 }}
            >
              {dictionary['start journey']}
            </Button>
          )}
        </Box>
      </Paper>

      {(chapter || map) && (
        <Card elevation={0} sx={{ mt: 2 }}>
          {chapter ? (
            <CardActionArea
              component={Link}
              href={`/${lang}/chapters/${chapter.id}`}
            >
              <CardContent
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                <HistoryEdu color="action" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap>
                    {chapter.title || dictionary['untitled chapter']}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {chapter.status === 'published'
                      ? dictionary.published
                      : dictionary['writing in progress']}
                  </Typography>
                </Box>
                <ChevronRight color="action" />
              </CardContent>
            </CardActionArea>
          ) : (
            <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {dictionary['not recorded as chapter']}
              </Typography>
              <Button
                fullWidth
                disableElevation
                variant="contained"
                color="secondary"
                startIcon={<HistoryEdu />}
                loading={recording}
                onClick={handleRecord}
              >
                {dictionary['record as chapter']}
              </Button>
            </Box>
          )}
        </Card>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setDeleteOpen(true);
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary.delete} />
        </MenuItem>
      </Menu>

      <EndJourneyDialog
        open={endOpen}
        onClose={() => setEndOpen(false)}
        onEnd={handleEnd}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={dictionary['sure to delete journey']}
      />

      <ConfirmDeleteDialog
        open={Boolean(pendingDeleteCheckin)}
        onClose={() => setPendingDeleteCheckin(null)}
        onConfirm={handleRemoveCheckin}
        title={dictionary['sure to delete checkin']}
      />

      <SpotPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectReview}
        reviews={reviews}
        usedReviewIds={usedReviewIds}
      />

      <Dialog
        open={Boolean(pendingReview)}
        onClose={() => setPendingReview(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{dictionary['add checkin']}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {pendingReview?.name}
          </Typography>
          <TextField
            fullWidth
            type="datetime-local"
            label={dictionary['checkin time']}
            value={pendingTime}
            error={Boolean(pendingTime) && !pendingTimeValid}
            onChange={(event) => setPendingTime(event.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: timeRange.min, max: timeRange.max }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setPendingReview(null)}>
            {dictionary.cancel}
          </Button>
          <Button
            variant="contained"
            loading={addingCheckin}
            disabled={!pendingTimeValid}
            onClick={handleConfirmCheckin}
          >
            {dictionary.add}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

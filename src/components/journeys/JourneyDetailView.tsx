'use client';

import {
  ChevronRight,
  Delete,
  HistoryEdu,
  MoreVert,
  Place
} from '@mui/icons-material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  timelineOppositeContentClasses
} from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  AppMap,
  Chapter,
  Image,
  Journey,
  JourneyCheckin
} from '../../../types';
import { createChapter } from '../../actions/chapters';
import { deleteJourney, updateCheckin } from '../../actions/journeys';
import useDictionary from '../../hooks/useDictionary';
import { createChapterContent } from '../../utils/chapterContent';
import { trailDistanceMeters } from '../../utils/geo';
import { decodePath } from '../../utils/polyline';
import ConfirmDeleteDialog from '../chapters/ConfirmDeleteDialog';
import MapLinkChip from '../chapters/MapLinkChip';
import NoContents from '../common/NoContents';
import CheckinImageStrip from './CheckinImageStrip';
import CheckinNoteField from './CheckinNoteField';
import JourneyMap from './JourneyMap';

type Props = {
  journey: Journey;
  chapter: Chapter | null;
  map: AppMap;
};

export default function JourneyDetailView({ journey, chapter, map }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recording, setRecording] = useState(false);

  const [checkins, setCheckins] = useState(journey.checkins);
  const checkinsRef = useRef(journey.checkins);

  const trail = useMemo(
    () => decodePath(journey.encoded_path),
    [journey.encoded_path]
  );

  const sortedCheckins = useMemo(
    () =>
      [...checkins].sort((a, b) =>
        a.checked_in_at.localeCompare(b.checked_in_at)
      ),
    [checkins]
  );

  const checkinSpots = useMemo(
    () => checkins.map((checkin) => checkin.spot),
    [checkins]
  );

  const saveCheckin = useCallback(
    async (
      checkin: JourneyCheckin,
      params: { image_ids?: number[]; note?: string | null }
    ) => {
      const { success, data, error } = await updateCheckin(
        journey.id,
        checkin.id,
        params
      );

      if (!success || !data) {
        enqueueSnackbar(error ?? dictionary['an error occurred'], {
          variant: 'error'
        });
        return;
      }

      checkinsRef.current = checkinsRef.current.map((existing) =>
        existing.id === data.id ? data : existing
      );
      setCheckins(checkinsRef.current);
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
    async (checkin: JourneyCheckin, imageId: number) => {
      const latest =
        checkinsRef.current.find((existing) => existing.id === checkin.id) ??
        checkin;

      await saveCheckin(checkin, {
        image_ids: latest.images
          .filter((existing) => existing.id !== imageId)
          .map((existing) => existing.id)
      });
    },
    [saveCheckin]
  );

  const handleSaveNote = useCallback(
    async (checkin: JourneyCheckin, note: string | null) => {
      await saveCheckin(checkin, { note });
    },
    [saveCheckin]
  );

  const trailKm = useMemo(() => {
    const meters = trailDistanceMeters(trail);
    return meters > 0 ? (meters / 1000).toFixed(1) : null;
  }, [trail]);

  const active = !journey.finished_at;

  const handleRecord = useCallback(async () => {
    setRecording(true);

    const { success, data, error } = await createChapter(map.id, {
      title: dictionary['untitled journey'],
      content: createChapterContent({ ...journey, checkins }, trail),
      journey_id: journey.id
    });

    if (!success || !data) {
      enqueueSnackbar(error ?? dictionary['an error occurred'], {
        variant: 'error'
      });
      setRecording(false);
      return;
    }

    router.push(`/${lang}/maps/${map.id}/chapters/${data.id}`);
  }, [map.id, journey, checkins, trail, router, lang, dictionary]);

  const handleDeleteConfirm = useCallback(async () => {
    const { success } = await deleteJourney(journey.id);

    if (!success) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      return;
    }

    enqueueSnackbar(dictionary['delete journey success'], {
      variant: 'success'
    });
    router.push(`/${lang}/maps/${map.id}`);
  }, [journey.id, dictionary, router, lang, map.id]);

  const formatDay = (value: string) =>
    new Date(value).toLocaleDateString(lang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString(lang, {
      hour: '2-digit',
      minute: '2-digit'
    });

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString(lang, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <>
      <Paper elevation={0} sx={{ overflow: 'hidden' }}>
        <JourneyMap
          spots={checkinSpots}
          path={trail}
          locale={lang}
          height={{ xs: 260, sm: 320 }}
        />

        <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <MapLinkChip map={map} locale={lang} />
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
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {[
              journey.started_at ? formatDateTime(journey.started_at) : null,
              journey.finished_at ? formatDateTime(journey.finished_at) : null
            ]
              .filter(Boolean)
              .join(' – ')}
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
                  km
                </Typography>
              </Stack>
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {sortedCheckins.length < 1 ? (
            <NoContents icon={Place} message={dictionary['no checkins']} />
          ) : (
            <Timeline
              sx={{
                [`& .${timelineOppositeContentClasses.root}`]: {
                  flex: 0.2
                }
              }}
            >
              {sortedCheckins.map((checkin, index) => (
                <TimelineItem key={checkin.id}>
                  <TimelineOppositeContent
                    sx={{ m: 'auto 0' }}
                    align="right"
                    variant="body2"
                    color="text.secondary"
                  >
                    {formatTime(checkin.checked_in_at)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineConnector
                      sx={index === 0 ? { visibility: 'hidden' } : undefined}
                    />
                    <TimelineDot color="primary">
                      <Place fontSize="small" />
                    </TimelineDot>
                    <TimelineConnector
                      sx={
                        index === sortedCheckins.length - 1
                          ? { visibility: 'hidden' }
                          : undefined
                      }
                    />
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2, m: 'auto 0' }}>
                    <Typography variant="subtitle2" component="span">
                      {checkin.spot.name}
                    </Typography>

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
        </Box>
      </Paper>

      <Card elevation={0} sx={{ mt: 2 }}>
        {chapter ? (
          <CardActionArea
            component={Link}
            href={`/${lang}/maps/${map.id}/chapters/${chapter.id}`}
          >
            <CardContent
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
            >
              <HistoryEdu color="action" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {chapter.title || dictionary['untitled journey']}
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
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {dictionary['not recorded as chapter']}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<HistoryEdu />}
              loading={recording}
              onClick={handleRecord}
            >
              {dictionary['record as chapter']}
            </Button>
          </CardContent>
        )}
      </Card>

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

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={dictionary['sure to delete journey']}
      />
    </>
  );
}

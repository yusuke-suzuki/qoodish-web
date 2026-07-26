'use client';

import {
  AddLocationAlt,
  Autorenew,
  CheckCircle,
  Delete,
  DirectionsWalk,
  MoreVert,
  Place,
  Visibility
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import type { LexicalEditor } from 'lexical';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { AppMap, Chapter, Journal, Journey, Review } from '../../../types';
import useChapter from '../../hooks/useChapter';
import useDictionary from '../../hooks/useDictionary';
import useLocalDateTime from '../../hooks/useLocalDateTime';
import { isContentEmpty } from '../../utils/chapterContent';
import {
  createMapFeatures,
  featureSpots,
  spotFeature
} from '../../utils/mapFeatures';
import SpotPickerDialog from '../journeys/SpotPickerDialog';
import ChapterAuthorCard from './ChapterAuthorCard';
import ChapterAuthorHeader from './ChapterAuthorHeader';
import ChapterContentEditor from './ChapterContentEditor';
import ChapterCover from './ChapterCover';
import ChapterMapCard from './ChapterMapCard';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import ConfirmDialog from './ConfirmDialog';
import MapLinkChip from './MapLinkChip';
import { $replaceChapterContent } from './replaceChapterContent';

const LONG_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

type Props = {
  chapter: Chapter;
  // Deleting a map nullifies the chapters on it, so the chapter outlives it.
  map: AppMap | null;
  journey: Journey | null;
  reviews: Review[];
  authorJournal: Journal | null;
  authorPageCount: number;
};

export default function ChapterEditor({
  chapter: initialChapter,
  map,
  journey,
  reviews,
  authorJournal,
  authorPageCount
}: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();
  const formatDateTime = useLocalDateTime();
  const router = useRouter();

  const readPath = `/${lang}/chapters/${initialChapter.id}`;

  const {
    chapter,
    unsaved,
    updateTitle,
    updateContent,
    updateMapFeatures,
    updateCover,
    discardChapter,
    publishChapter,
    unpublishChapter
  } = useChapter(initialChapter);

  const markerSpots = useMemo(
    () => featureSpots(chapter.map_features),
    [chapter.map_features]
  );

  const mapCenter = useMemo(
    () =>
      map ? { latitude: map.latitude, longitude: map.longitude } : undefined,
    [map]
  );

  const [coverSaving, setCoverSaving] = useState(false);
  const [markerPickerOpen, setMarkerPickerOpen] = useState(false);

  const usedReviewIds = useMemo(
    () =>
      new Set(
        reviews
          .filter((review) =>
            markerSpots.some(
              (spot) =>
                spot.latitude === review.latitude &&
                spot.longitude === review.longitude
            )
          )
          .map((review) => review.id)
      ),
    [reviews, markerSpots]
  );

  const handleAddMarker = useCallback(
    (review: Review) => {
      setMarkerPickerOpen(false);
      updateMapFeatures({
        type: 'FeatureCollection',
        features: [
          ...chapter.map_features.features,
          spotFeature({
            name: review.name,
            latitude: review.latitude,
            longitude: review.longitude
          })
        ]
      });
    },
    [chapter.map_features, updateMapFeatures]
  );

  const handleRemoveMarker = useCallback(
    (index: number) => {
      updateMapFeatures({
        type: 'FeatureCollection',
        features: chapter.map_features.features.filter(
          (_, featureIndex) => featureIndex !== index
        )
      });
    },
    [chapter.map_features, updateMapFeatures]
  );

  const [pageMenuAnchor, setPageMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);

  const editorRef = useRef<LexicalEditor | null>(null);

  const handlePublishConfirm = useCallback(async () => {
    const { success } = await publishChapter();
    setPublishDialogOpen(false);

    if (!success) {
      return;
    }

    enqueueSnackbar(dictionary['publish chapter success'], {
      variant: 'success'
    });
    router.push(readPath);
  }, [publishChapter, dictionary, router, readPath]);

  const handleUnpublishConfirm = useCallback(async () => {
    const { success } = await unpublishChapter();
    setUnpublishDialogOpen(false);

    if (!success) {
      return;
    }

    enqueueSnackbar(dictionary['revert to draft success'], {
      variant: 'success'
    });
  }, [unpublishChapter, dictionary]);

  const handleRegenerateClick = useCallback(() => {
    setPageMenuAnchor(null);
    setRegenerateDialogOpen(true);
  }, []);

  const handleRegenerateConfirm = useCallback(() => {
    if (!journey) {
      return;
    }

    // Replace the content through an editor update so the regenerate lands on
    // the history stack and can be undone; OnChangePlugin then autosaves it.
    editorRef.current?.update(() => {
      $replaceChapterContent(journey);
    });
    updateMapFeatures(createMapFeatures(journey));
    setRegenerateDialogOpen(false);
    enqueueSnackbar(dictionary['regenerate chapter success'], {
      variant: 'success'
    });
  }, [journey, dictionary, updateMapFeatures]);

  const handleDeleteClick = useCallback(() => {
    setPageMenuAnchor(null);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    const { success } = await discardChapter();

    if (!success) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      return;
    }

    enqueueSnackbar(dictionary['delete chapter success'], {
      variant: 'success'
    });
    setDeleteDialogOpen(false);
    router.push(
      journey
        ? `/${lang}/journeys/${journey.id}`
        : map
          ? `/${lang}/maps/${map.id}`
          : `/${lang}`
    );
  }, [discardChapter, dictionary, router, lang, map, journey]);

  return (
    <>
      <Paper elevation={0} sx={{ overflow: 'hidden' }}>
        <ChapterCover
          image={chapter.image}
          editable
          onChange={updateCover}
          onSavingChange={setCoverSaving}
        />

        <Box sx={{ px: { xs: 2.5, sm: 5 }, py: { xs: 4, sm: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <MapLinkChip
                map={map}
                mapDeleted={chapter.map_id === null}
                locale={lang}
              />
            </Box>

            {chapter.status === 'draft' && !isContentEmpty(chapter.content) && (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                disabled={unsaved || coverSaving}
                onClick={() => setPublishDialogOpen(true)}
              >
                {dictionary.publish}
              </Button>
            )}

            {chapter.status === 'published' && (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<CheckCircle />}
                onClick={() => setUnpublishDialogOpen(true)}
              >
                {dictionary.published}
              </Button>
            )}

            <IconButton
              size="small"
              aria-label={dictionary.more}
              onClick={(event) => setPageMenuAnchor(event.currentTarget)}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            variant="standard"
            value={chapter.title}
            placeholder={dictionary['chapter title placeholder']}
            onChange={(event) => updateTitle(event.target.value)}
            slotProps={{
              input: {
                disableUnderline: true,
                sx: (theme) => ({
                  ...theme.typography.h4,
                  '& .MuiInputBase-input': {
                    py: 0,
                    height: 'auto'
                  }
                })
              },
              htmlInput: {
                'aria-label': dictionary['chapter title placeholder'],
                maxLength: 100
              }
            }}
            sx={{ mb: 1 }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {formatDateTime(chapter.created_at, LONG_DATE_OPTIONS)}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <ChapterAuthorHeader author={chapter.author} locale={lang} />
          </Box>

          <Divider sx={{ mb: 4 }} />

          <ChapterContentEditor
            initialContent={chapter.content}
            placeholder={dictionary['chapter block placeholder']}
            onChange={updateContent}
            editorRef={editorRef}
          />

          <ChapterMapCard
            map={map}
            mapDeleted={chapter.map_id === null}
            spots={markerSpots}
            fallbackCenter={mapCenter}
            locale={lang}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1
              }}
            >
              {markerSpots.map((spot, index) => (
                <Chip
                  key={`${spot.name}-${spot.latitude}-${spot.longitude}-${index}`}
                  icon={<Place />}
                  label={spot.name}
                  onDelete={() => handleRemoveMarker(index)}
                />
              ))}
              {map && (
                <Chip
                  icon={<AddLocationAlt />}
                  label={dictionary['add marker']}
                  variant="outlined"
                  clickable
                  onClick={() => setMarkerPickerOpen(true)}
                />
              )}
            </Box>
          </ChapterMapCard>

          <ChapterAuthorCard
            author={chapter.author}
            journal={authorJournal}
            locale={lang}
            pageCount={authorPageCount}
          />
        </Box>
      </Paper>

      <Toolbar />

      <Menu
        anchorEl={pageMenuAnchor}
        open={Boolean(pageMenuAnchor)}
        onClose={() => setPageMenuAnchor(null)}
      >
        <MenuItem
          component={Link}
          href={readPath}
          onClick={() => setPageMenuAnchor(null)}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary.preview} />
        </MenuItem>

        <Divider />

        {journey && (
          <MenuItem
            component={Link}
            href={`/${lang}/journeys/${journey.id}`}
            onClick={() => setPageMenuAnchor(null)}
          >
            <ListItemIcon>
              <DirectionsWalk fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary['edit journey']} />
          </MenuItem>
        )}

        {journey && (
          <MenuItem onClick={handleRegenerateClick}>
            <ListItemIcon>
              <Autorenew fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary['regenerate from journey']} />
          </MenuItem>
        )}

        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary.delete} />
        </MenuItem>
      </Menu>

      <SpotPickerDialog
        open={markerPickerOpen}
        onClose={() => setMarkerPickerOpen(false)}
        onSelect={handleAddMarker}
        reviews={reviews}
        usedReviewIds={usedReviewIds}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={regenerateDialogOpen}
        title={dictionary['sure to regenerate chapter']}
        description={dictionary['regenerate chapter description']}
        confirmLabel={dictionary.regenerate}
        onClose={() => setRegenerateDialogOpen(false)}
        onConfirm={handleRegenerateConfirm}
      />

      <ConfirmDialog
        open={publishDialogOpen}
        title={dictionary['sure to publish chapter']}
        description={dictionary['publish chapter description']}
        confirmLabel={dictionary.publish}
        onClose={() => setPublishDialogOpen(false)}
        onConfirm={handlePublishConfirm}
      />

      <ConfirmDialog
        open={unpublishDialogOpen}
        title={dictionary['sure to revert to draft']}
        description={dictionary['revert to draft description']}
        confirmLabel={dictionary['revert to draft']}
        onClose={() => setUnpublishDialogOpen(false)}
        onConfirm={handleUnpublishConfirm}
      />
    </>
  );
}

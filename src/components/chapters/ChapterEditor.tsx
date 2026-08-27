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
import { useRef, useState } from 'react';
import type {
  AppMap,
  Chapter,
  Journal,
  Journey,
  Review
} from '../../../types/index.ts';
import useChapter from '../../hooks/useChapter.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalDateTime from '../../hooks/useLocalDateTime.ts';
import { isContentEmpty } from '../../utils/chapterContent.ts';
import {
  createMapFeatures,
  featureSpots,
  spotFeature
} from '../../utils/mapFeatures.ts';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog.tsx';
import ConfirmDialog from '../common/ConfirmDialog.tsx';
import SpotPickerDialog from '../journeys/SpotPickerDialog.tsx';
import ChapterAuthorCard from './ChapterAuthorCard.tsx';
import ChapterAuthorHeader from './ChapterAuthorHeader.tsx';
import ChapterContentEditor from './ChapterContentEditor.tsx';
import ChapterCover from './ChapterCover.tsx';
import ChapterMapCard from './ChapterMapCard.tsx';
import MapLinkChip from './MapLinkChip.tsx';
import { $replaceChapterContent } from './replaceChapterContent.ts';

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

  const markerSpots = featureSpots(chapter.map_features);

  const mapCenter = map
    ? { latitude: map.latitude, longitude: map.longitude }
    : undefined;

  const [coverSaving, setCoverSaving] = useState(false);
  const [markerPickerOpen, setMarkerPickerOpen] = useState(false);

  const usedReviewIds = new Set(
    reviews
      .filter((review) =>
        markerSpots.some(
          (spot) =>
            spot.latitude === review.latitude &&
            spot.longitude === review.longitude
        )
      )
      .map((review) => review.id)
  );

  const handleAddMarker = (review: Review) => {
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
  };

  // featureSpots keeps only the Point features, so a chip's position in the
  // list is not the feature's position once the collection carries anything
  // else.
  const markerFeatureIndexes = chapter.map_features.features.flatMap(
    (feature, index) => (feature.geometry?.type === 'Point' ? [index] : [])
  );

  const handleRemoveMarker = (markerIndex: number) => {
    const featureIndex = markerFeatureIndexes[markerIndex];

    updateMapFeatures({
      type: 'FeatureCollection',
      features: chapter.map_features.features.filter(
        (_, index) => index !== featureIndex
      )
    });
  };

  const [pageMenuAnchor, setPageMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);

  const editorRef = useRef<LexicalEditor | null>(null);

  const handlePublishConfirm = async () => {
    const { success } = await publishChapter();
    setPublishDialogOpen(false);

    if (!success) {
      return;
    }

    enqueueSnackbar(dictionary['publish chapter success'], {
      variant: 'success'
    });
    router.push(readPath);
  };

  const handleUnpublishConfirm = async () => {
    const { success } = await unpublishChapter();
    setUnpublishDialogOpen(false);

    if (!success) {
      return;
    }

    enqueueSnackbar(dictionary['revert to draft success'], {
      variant: 'success'
    });
  };

  const handleRegenerateClick = () => {
    setPageMenuAnchor(null);
    setRegenerateDialogOpen(true);
  };

  const handleRegenerateConfirm = () => {
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
  };

  const handleDeleteClick = () => {
    setPageMenuAnchor(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
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
  };

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
                sx: {
                  typography: 'h4',
                  '& .MuiInputBase-input': {
                    py: 0,
                    height: 'auto'
                  }
                }
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
                  // biome-ignore lint/suspicious/noArrayIndexKey: map_features arrives from the API, which does not guarantee that a name and its coordinates appear once
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
        title={dictionary['sure to delete chapter']}
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

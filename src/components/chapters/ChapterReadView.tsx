'use client';

import { Delete, Edit, MoreVert } from '@mui/icons-material';
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import type { AppMap, Chapter, Journal } from '../../../types';
import { deleteChapter } from '../../actions/chapters';
import useDictionary from '../../hooks/useDictionary';
import useLocalDateTime from '../../hooks/useLocalDateTime';
import { featureSpots } from '../../utils/mapFeatures';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog';
import ChapterActions from './ChapterActions';
import ChapterAuthorCard from './ChapterAuthorCard';
import ChapterAuthorHeader from './ChapterAuthorHeader';
import ChapterContentReader from './ChapterContentReader';
import ChapterCover from './ChapterCover';
import ChapterMapCard from './ChapterMapCard';
import MapLinkChip from './MapLinkChip';

const LONG_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

type Props = {
  chapter: Chapter;
  // Deleting a map nullifies the chapters on it, so the chapter outlives it.
  map: AppMap | null;
  authorJournal: Journal | null;
  authorPageCount: number;
};

export default function ChapterReadView({
  chapter,
  map,
  authorJournal,
  authorPageCount
}: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();
  const formatDateTime = useLocalDateTime();
  const router = useRouter();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const markerSpots = featureSpots(chapter.map_features);

  const mapCenter = map
    ? { latitude: map.latitude, longitude: map.longitude }
    : undefined;

  const handleDeleteClick = () => {
    setMenuAnchor(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const { success } = await deleteChapter(chapter.id);

    if (!success) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      return;
    }

    enqueueSnackbar(dictionary['delete chapter success'], {
      variant: 'success'
    });
    setDeleteDialogOpen(false);

    if (chapter.journey_id) {
      router.push(`/${lang}/journeys/${chapter.journey_id}`);
      return;
    }

    router.push(map ? `/${lang}/maps/${map.id}` : `/${lang}`);
  };

  return (
    <>
      <Paper elevation={0} sx={{ overflow: 'hidden' }}>
        <ChapterCover image={chapter.image} editable={false} />

        <Box sx={{ px: { xs: 2.5, sm: 5 }, py: { xs: 4, sm: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <MapLinkChip
                map={map}
                mapDeleted={chapter.map_id === null}
                locale={lang}
              />
            </Box>

            {chapter.editable && (
              <IconButton
                size="small"
                aria-label={dictionary.more}
                onClick={(event) => setMenuAnchor(event.currentTarget)}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            )}
          </Box>

          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            {chapter.title || dictionary['untitled chapter']}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {formatDateTime(chapter.created_at, LONG_DATE_OPTIONS)}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <ChapterAuthorHeader author={chapter.author} locale={lang} />
          </Box>

          {chapter.status === 'published' && (
            <Box sx={{ mb: 2 }}>
              <ChapterActions chapter={chapter} />
            </Box>
          )}

          <Divider sx={{ mb: 4 }} />

          <ChapterContentReader content={chapter.content} />

          <ChapterMapCard
            map={map}
            mapDeleted={chapter.map_id === null}
            spots={markerSpots}
            fallbackCenter={mapCenter}
            locale={lang}
          />

          <ChapterAuthorCard
            author={chapter.author}
            journal={authorJournal}
            locale={lang}
            pageCount={authorPageCount}
          />
        </Box>
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          component={Link}
          href={`/${lang}/chapters/${chapter.id}/edit`}
          onClick={() => setMenuAnchor(null)}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary.edit} />
        </MenuItem>

        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary.delete} />
        </MenuItem>
      </Menu>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        title={dictionary['sure to delete chapter']}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

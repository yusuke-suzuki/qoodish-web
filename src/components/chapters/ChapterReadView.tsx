'use client';

import { Delete, Edit, MoreVert, ReportProblem } from '@mui/icons-material';
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
import { useMemo, useState } from 'react';
import type {
  AppMap,
  Chapter,
  Comment,
  ContentRef,
  Journal
} from '../../../types/index.ts';
import { deleteChapter } from '../../actions/chapters.ts';
import useCountLabel from '../../hooks/useCountLabel.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalDateTime from '../../hooks/useLocalDateTime.ts';
import { featureSpots } from '../../utils/mapFeatures.ts';
import CommentForm from '../common/CommentForm.tsx';
import CommentList from '../common/CommentList.tsx';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog.tsx';
import ReportDialog from '../common/ReportDialog.tsx';
import ChapterActions from './ChapterActions.tsx';
import ChapterAuthorCard from './ChapterAuthorCard.tsx';
import ChapterAuthorHeader from './ChapterAuthorHeader.tsx';
import ChapterContentReader from './ChapterContentReader.tsx';
import ChapterCover from './ChapterCover.tsx';
import ChapterMapCard from './ChapterMapCard.tsx';
import MapLinkChip from './MapLinkChip.tsx';

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
  comments: Comment[];
};

export default function ChapterReadView({
  chapter,
  map,
  authorJournal,
  authorPageCount,
  comments
}: Props) {
  const dictionary = useDictionary();
  const countLabel = useCountLabel();
  const { lang } = useParams<{ lang: string }>();
  const formatDateTime = useLocalDateTime();
  const router = useRouter();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const markerSpots = featureSpots(chapter.map_features);

  const subject = useMemo<ContentRef>(
    () => ({ type: 'chapter', id: chapter.id }),
    [chapter.id]
  );

  const mapCenter = map
    ? { latitude: map.latitude, longitude: map.longitude }
    : undefined;

  const handleDeleteClick = () => {
    setMenuAnchor(null);
    setDeleteDialogOpen(true);
  };

  const handleReportClick = () => {
    setMenuAnchor(null);
    setReportDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const { success } = await deleteChapter(
      chapter.id,
      chapter.map_id,
      chapter.author.id
    );

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
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
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

            <IconButton
              size="small"
              title={dictionary.more}
              aria-label={dictionary.more}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              <MoreVert fontSize="small" />
            </IconButton>
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

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {countLabel('comment count', comments.length)}
          </Typography>

          <CommentForm subject={subject} onCommentAdded={router.refresh} />

          {comments.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <CommentList
                subject={subject}
                comments={comments}
                onDeleted={router.refresh}
                onLiked={router.refresh}
              />
            </Box>
          )}
        </Box>
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {chapter.editable ? (
          [
            <MenuItem
              key="edit"
              component={Link}
              href={`/${lang}/chapters/${chapter.id}/edit`}
              onClick={() => setMenuAnchor(null)}
            >
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={dictionary.edit} />
            </MenuItem>,
            <MenuItem key="delete" onClick={handleDeleteClick}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={dictionary.delete} />
            </MenuItem>
          ]
        ) : (
          <MenuItem onClick={handleReportClick}>
            <ListItemIcon>
              <ReportProblem fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary['report content']} />
          </MenuItem>
        )}
      </Menu>

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        moderatableType="Chapter"
        moderatableId={chapter.id}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        title={dictionary['sure to delete chapter']}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

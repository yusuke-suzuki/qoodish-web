'use client';

import { Delete, MoreVert, Unpublished } from '@mui/icons-material';
import {
  Box,
  Button,
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
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import type { AppMap, Chapter } from '../../../types';
import useChapter from '../../hooks/useChapter';
import useDictionary from '../../hooks/useDictionary';
import { isContentEmpty } from '../../utils/chapterContent';
import { journeyDate } from '../../utils/chapterDate';
import ChapterAuthorCard from './ChapterAuthorCard';
import ChapterAuthorHeader from './ChapterAuthorHeader';
import ChapterContentEditor from './ChapterContentEditor';
import ChapterMapCard from './ChapterMapCard';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import MapLinkChip from './MapLinkChip';

type Props = {
  chapter: Chapter;
  map: AppMap;
  authorPageCount: number;
};

export default function ChapterEditorView({
  chapter: initialChapter,
  map,
  authorPageCount
}: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();

  const {
    chapter,
    updateTitle,
    updateContent,
    discardChapter,
    publishChapter,
    unpublishChapter
  } = useChapter(initialChapter);

  const editable = initialChapter.editable;

  const [pageMenuAnchor, setPageMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleUnpublishClick = useCallback(() => {
    setPageMenuAnchor(null);
    unpublishChapter();
  }, [unpublishChapter]);

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
    router.push(`/${lang}/maps/${map.id}`);
  }, [discardChapter, dictionary, router, lang, map.id]);

  return (
    <>
      <Paper
        elevation={0}
        sx={{ px: { xs: 2.5, sm: 5 }, py: { xs: 4, sm: 6 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <MapLinkChip map={map} locale={lang} />
          </Box>

          {editable &&
            chapter.status === 'draft' &&
            !isContentEmpty(chapter.content) && (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={publishChapter}
              >
                {dictionary.publish}
              </Button>
            )}

          {editable && (
            <IconButton
              size="small"
              aria-label={dictionary.more}
              onClick={(event) => setPageMenuAnchor(event.currentTarget)}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          )}
        </Box>

        {editable ? (
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
        ) : (
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            {chapter.title || dictionary['untitled journey']}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {new Date(journeyDate(chapter)).toLocaleDateString(lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <ChapterAuthorHeader author={chapter.author} locale={lang} />
        </Box>

        <Divider sx={{ mb: 4 }} />

        <ChapterContentEditor
          key={chapter.id}
          initialContent={chapter.content}
          placeholder={dictionary['chapter empty state']}
          readOnly={!editable}
          onChange={updateContent}
        />

        {editable && chapter.status === 'published' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Typography variant="caption" color="success.main">
              {dictionary.published}
            </Typography>
          </Box>
        )}

        <ChapterMapCard map={map} locale={lang} />

        <ChapterAuthorCard
          author={chapter.author}
          locale={lang}
          pageCount={authorPageCount}
        />
      </Paper>

      {editable && <Toolbar />}

      <Menu
        anchorEl={pageMenuAnchor}
        open={Boolean(pageMenuAnchor)}
        onClose={() => setPageMenuAnchor(null)}
      >
        {chapter.status === 'published' && (
          <MenuItem onClick={handleUnpublishClick}>
            <ListItemIcon>
              <Unpublished fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary['revert to draft']} />
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary.delete} />
        </MenuItem>
      </Menu>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

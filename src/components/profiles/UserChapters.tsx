'use client';

import { Delete, HistoryEdu, MoreVert } from '@mui/icons-material';
import {
  Box,
  CardActionArea,
  CardMedia,
  Chip,
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
import { type MouseEvent, memo, useState } from 'react';
import type { Chapter } from '../../../types/index.ts';
import { deleteChapter } from '../../actions/chapters.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalDateTime from '../../hooks/useLocalDateTime.ts';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog.tsx';
import NoContents from '../common/NoContents.tsx';

const THUMBNAIL_SIZE = { xs: 80, sm: 100 };

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
};

function UserChapters({ chapters: initialChapters }: { chapters: Chapter[] }) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();
  const formatDateTime = useLocalDateTime();
  const router = useRouter();

  const [chapters, setChapters] = useState(initialChapters);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuChapter, setMenuChapter] = useState<Chapter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);

  const openMenu = (event: MouseEvent<HTMLElement>, chapter: Chapter) => {
    setMenuAnchor(event.currentTarget);
    setMenuChapter(chapter);
  };

  const closeMenu = () => setMenuAnchor(null);

  const handleDeleteClick = () => {
    setDeleteTarget(menuChapter);
    closeMenu();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    const target = deleteTarget;
    const { success } = await deleteChapter(target.id);

    if (!success) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      return;
    }

    setChapters((current) =>
      current.filter((chapter) => chapter.id !== target.id)
    );
    enqueueSnackbar(dictionary['delete chapter success'], {
      variant: 'success'
    });
    setDeleteTarget(null);
    // The profile renders a server-fetched chapter count alongside this list.
    router.refresh();
  };

  if (chapters.length < 1) {
    return (
      <NoContents icon={HistoryEdu} message={dictionary['no chapters yet']} />
    );
  }

  return (
    <>
      <Paper elevation={0}>
        {chapters.map((chapter, index) => (
          <Box key={chapter.id}>
            <CardActionArea
              component={Link}
              href={`/${lang}/chapters/${chapter.id}`}
              sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {chapter.title || dictionary['untitled chapter']}
                </Typography>

                {chapter.map?.name && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {chapter.map.name}
                  </Typography>
                )}

                <Box
                  sx={{
                    mt: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(chapter.created_at, DATE_OPTIONS)}
                  </Typography>
                  {chapter.status === 'draft' && (
                    <Chip label={dictionary.draft} size="small" />
                  )}
                </Box>
              </Box>

              {chapter.image ? (
                <CardMedia
                  component="img"
                  image={chapter.image.card}
                  alt=""
                  sx={{
                    width: THUMBNAIL_SIZE,
                    height: THUMBNAIL_SIZE,
                    flexShrink: 0,
                    borderRadius: 1,
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: THUMBNAIL_SIZE,
                    height: THUMBNAIL_SIZE,
                    flexShrink: 0,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <HistoryEdu color="disabled" />
                </Box>
              )}
            </CardActionArea>

            {chapter.editable && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  px: 1,
                  pb: 1
                }}
              >
                <IconButton
                  aria-label={dictionary.more}
                  onClick={(event) => openMenu(event, chapter)}
                >
                  <MoreVert />
                </IconButton>
              </Box>
            )}

            {index < chapters.length - 1 && <Divider />}
          </Box>
        ))}
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary.delete} />
        </MenuItem>
      </Menu>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={dictionary['sure to delete chapter']}
      />
    </>
  );
}

export default memo(UserChapters);

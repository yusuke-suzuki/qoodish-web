'use client';

import { Delete, HistoryEdu, MoreVert } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useState } from 'react';
import type { Chapter } from '../../../types';
import { deleteChapter } from '../../actions/chapters';
import useDictionary from '../../hooks/useDictionary';
import ConfirmDeleteDialog from '../chapters/ConfirmDeleteDialog';
import NoContents from '../common/NoContents';

function UserChapters({ chapters: initialChapters }: { chapters: Chapter[] }) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  const [chapters, setChapters] = useState(initialChapters);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuChapter, setMenuChapter] = useState<Chapter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);

  const openMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, chapter: Chapter) => {
      setMenuAnchor(event.currentTarget);
      setMenuChapter(chapter);
    },
    []
  );

  const closeMenu = useCallback(() => setMenuAnchor(null), []);

  const handleDeleteClick = useCallback(() => {
    setDeleteTarget(menuChapter);
    closeMenu();
  }, [menuChapter, closeMenu]);

  const handleDeleteConfirm = useCallback(async () => {
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
  }, [deleteTarget, dictionary]);

  if (chapters.length < 1) {
    return (
      <NoContents icon={HistoryEdu} message={dictionary['no chapters yet']} />
    );
  }

  return (
    <>
      <Paper elevation={0}>
        <List disablePadding>
          {chapters.map((chapter, index) => (
            <ListItem
              key={chapter.id}
              disablePadding
              divider={index < chapters.length - 1}
            >
              <ListItemButton
                component={Link}
                href={`/${lang}/maps/${chapter.map_id}/chapters/${chapter.id}`}
                disabled={chapter.map_id === null}
                sx={{ flex: 1, minWidth: 0 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <HistoryEdu fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={chapter.title || dictionary['untitled journey']}
                  secondary={
                    <>
                      <Box component="span" sx={{ display: 'block' }}>
                        {new Date(chapter.created_at).toLocaleDateString(lang, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Box>
                      {chapter.map?.name && (
                        <Box
                          component="span"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {chapter.map.name}
                        </Box>
                      )}
                    </>
                  }
                  slotProps={{ primary: { noWrap: true } }}
                />
                {chapter.status === 'draft' && (
                  <Chip
                    label={dictionary.draft}
                    size="small"
                    sx={{ ml: 1, flexShrink: 0 }}
                  />
                )}
              </ListItemButton>

              {chapter.editable && (
                <IconButton
                  aria-label={dictionary.more}
                  onClick={(event) => openMenu(event, chapter)}
                  sx={{ mr: 0.5 }}
                >
                  <MoreVert />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
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

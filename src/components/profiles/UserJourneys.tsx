'use client';

import { Delete, DirectionsWalk, MoreVert } from '@mui/icons-material';
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
import type { JourneySummary } from '../../../types';
import { deleteJourney } from '../../actions/journeys';
import useDictionary from '../../hooks/useDictionary';
import ConfirmDeleteDialog from '../chapters/ConfirmDeleteDialog';
import NoContents from '../common/NoContents';

function UserJourneys({
  journeys: initialJourneys
}: { journeys: JourneySummary[] }) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  const [journeys, setJourneys] = useState(initialJourneys);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuJourney, setMenuJourney] = useState<JourneySummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JourneySummary | null>(null);

  const openMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, journey: JourneySummary) => {
      setMenuAnchor(event.currentTarget);
      setMenuJourney(journey);
    },
    []
  );

  const closeMenu = useCallback(() => setMenuAnchor(null), []);

  const handleDeleteClick = useCallback(() => {
    setDeleteTarget(menuJourney);
    closeMenu();
  }, [menuJourney, closeMenu]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    const target = deleteTarget;
    const { success } = await deleteJourney(target.id);

    if (!success) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      return;
    }

    setJourneys((current) =>
      current.filter((journey) => journey.id !== target.id)
    );
    enqueueSnackbar(dictionary['delete journey success'], {
      variant: 'success'
    });
    setDeleteTarget(null);
  }, [deleteTarget, dictionary]);

  if (journeys.length < 1) {
    return (
      <NoContents
        icon={DirectionsWalk}
        message={dictionary['journeys will see here']}
      />
    );
  }

  return (
    <>
      <Paper elevation={0}>
        <List disablePadding>
          {journeys.map((journey, index) => {
            const active = !journey.finished_at;
            const dateSource = journey.finished_at ?? journey.started_at;

            return (
              <ListItem
                key={journey.id}
                disablePadding
                divider={index < journeys.length - 1}
              >
                <ListItemButton
                  component={Link}
                  href={`/${lang}/maps/${journey.map_id}/journeys/${journey.id}`}
                  disabled={journey.map_id === null}
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <DirectionsWalk fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      dateSource
                        ? new Date(dateSource).toLocaleString(lang, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : dictionary['untitled journey']
                    }
                    secondary={
                      <>
                        {journey.map?.name && (
                          <Box
                            component="span"
                            sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {journey.map.name}
                          </Box>
                        )}
                        <Box component="span" sx={{ display: 'block' }}>
                          {dictionary['checkins count'].replace(
                            '{count}',
                            String(journey.checkins_count)
                          )}
                        </Box>
                      </>
                    }
                    slotProps={{ primary: { noWrap: true } }}
                  />
                  {active && (
                    <Chip
                      label={dictionary['in progress']}
                      size="small"
                      color="primary"
                      sx={{ ml: 1, flexShrink: 0 }}
                    />
                  )}
                </ListItemButton>

                <IconButton
                  aria-label={dictionary.more}
                  onClick={(event) => openMenu(event, journey)}
                  sx={{ mr: 0.5 }}
                >
                  <MoreVert />
                </IconButton>
              </ListItem>
            );
          })}
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
        title={dictionary['sure to delete journey']}
      />
    </>
  );
}

export default memo(UserJourneys);

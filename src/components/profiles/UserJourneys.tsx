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
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { type MouseEvent, memo, useState } from 'react';
import type { JourneySummary } from '../../../types';
import { deleteJourney } from '../../actions/journeys';
import useDictionary from '../../hooks/useDictionary';
import useLocalDateTime from '../../hooks/useLocalDateTime';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog';
import NoContents from '../common/NoContents';

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
};

function UserJourneys({
  journeys: initialJourneys
}: { journeys: JourneySummary[] }) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();
  const formatLocal = useLocalDateTime();
  const router = useRouter();

  const [journeys, setJourneys] = useState(initialJourneys);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuJourney, setMenuJourney] = useState<JourneySummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JourneySummary | null>(null);

  const openMenu = (
    event: MouseEvent<HTMLElement>,
    journey: JourneySummary
  ) => {
    setMenuAnchor(event.currentTarget);
    setMenuJourney(journey);
  };

  const closeMenu = () => setMenuAnchor(null);

  const handleDeleteClick = () => {
    setDeleteTarget(menuJourney);
    closeMenu();
  };

  const handleDeleteConfirm = async () => {
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
    router.refresh();
  };

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
            const started = Boolean(journey.started_at);
            const active = started && !journey.finished_at;
            const dateSource =
              journey.finished_at ?? journey.started_at ?? journey.created_at;

            return (
              <ListItem
                key={journey.id}
                disablePadding
                divider={index < journeys.length - 1}
              >
                <ListItemButton
                  component={Link}
                  href={`/${lang}/journeys/${journey.id}`}
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <DirectionsWalk fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={formatLocal(dateSource, DATE_TIME_OPTIONS)}
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
                          {started
                            ? dictionary['checkins count'].replace(
                                '{count}',
                                String(journey.checkins_count)
                              )
                            : dictionary['milestones count'].replace(
                                '{count}',
                                String(journey.milestones_count)
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
                  {!started && (
                    <Chip
                      label={dictionary.planned}
                      size="small"
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

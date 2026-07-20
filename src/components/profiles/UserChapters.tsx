'use client';

import { HistoryEdu } from '@mui/icons-material';
import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { memo } from 'react';
import type { Chapter } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import NoContents from '../common/NoContents';

function UserChapters({ chapters }: { chapters: Chapter[] }) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  if (chapters.length < 1) {
    return (
      <NoContents icon={HistoryEdu} message={dictionary['no chapters yet']} />
    );
  }

  return (
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
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default memo(UserChapters);

'use client';

import { Bookmarks } from '@mui/icons-material';
import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { memo } from 'react';
import type { Journal } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import NoContents from '../common/NoContents';

type Props = {
  journals: Journal[];
};

function BookmarkedJournalList({ journals }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  if (journals.length < 1) {
    return (
      <NoContents
        icon={Bookmarks}
        message={dictionary['no bookmarked journals']}
      />
    );
  }

  return (
    <Paper elevation={0}>
      <List disablePadding>
        {journals.map((journal) => (
          <ListItemButton
            key={journal.id}
            LinkComponent={Link}
            href={`/${lang}/users/${journal.author.id}`}
          >
            <ListItemAvatar>
              <Avatar
                src={journal.author.image?.avatar ?? journal.author.image_url}
                alt={journal.author.name}
              />
            </ListItemAvatar>
            <ListItemText
              primary={journal.title}
              secondary={`${journal.author.name} · ${journal.chapters_count} ${dictionary['chapters count']}`}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}

export default memo(BookmarkedJournalList);

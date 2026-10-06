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
import type { Journal } from '../../../types/index.ts';
import useCountLabel from '../../hooks/useCountLabel.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import DiscoverButton from '../common/DiscoverButton.tsx';
import NoContents from '../common/NoContents.tsx';

type Props = {
  journals: Journal[];
};

function BookmarkedJournalList({ journals }: Props) {
  const dictionary = useDictionary();
  const countLabel = useCountLabel();
  const { lang } = useParams<{ lang: string }>();

  if (journals.length < 1) {
    return (
      <NoContents
        icon={Bookmarks}
        message={dictionary['no bookmarked journals']}
        action={<DiscoverButton />}
      />
    );
  }

  return (
    <Paper variant="outlined">
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
              secondary={`${journal.author.name} · ${countLabel('chapters count', journal.chapters_count)}`}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}

export default memo(BookmarkedJournalList);

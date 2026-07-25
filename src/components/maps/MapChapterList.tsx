import { HistoryEdu } from '@mui/icons-material';
import {
  Avatar,
  Box,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { memo } from 'react';
import type { Chapter } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import AuthorAvatar from '../common/AuthorAvatar';
import NoContents from '../common/NoContents';

type Props = {
  chapters: Chapter[];
};

function MapChapterList({ chapters }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  // The rows carry their own padding, so the panel around this list has none
  // to give the empty state.
  if (chapters.length < 1) {
    return (
      <Box sx={{ py: 4 }}>
        <NoContents icon={HistoryEdu} message={dictionary['no chapters yet']} />
      </Box>
    );
  }

  return (
    <List disablePadding>
      {chapters.map((chapter) => (
        <ListItemButton
          key={chapter.id}
          divider
          disableGutters
          href={`/${lang}/chapters/${chapter.id}`}
          LinkComponent={Link}
        >
          <ListItemAvatar>
            <Avatar
              alt={chapter.title}
              variant="rounded"
              src={chapter.image?.avatar}
            >
              <HistoryEdu />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={chapter.title || dictionary['untitled journey']}
            secondary={new Date(chapter.created_at).toLocaleDateString(lang, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
            slotProps={{
              primary: {
                noWrap: true
              },
              secondary: {
                noWrap: true
              }
            }}
          />
          <AuthorAvatar
            author={chapter.author}
            sx={{
              width: 24,
              height: 24
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
}

export default memo(MapChapterList);

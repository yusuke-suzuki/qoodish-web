'use client';

import { Favorite, FavoriteBorder, Link } from '@mui/icons-material';
import { Box, Checkbox, IconButton, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  type ChangeEvent,
  memo,
  useCallback,
  useContext,
  useState,
  useTransition
} from 'react';
import type { Chapter } from '../../../types';
import { likeChapter, unlikeChapter } from '../../actions/chapterLikes';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  chapter: Chapter;
};

function ChapterActions({ chapter }: Props) {
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();

  const [liked, setLiked] = useState(chapter.liked);
  const [isPending, startTransition] = useTransition();

  const handleLikeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!authenticated) {
        setSignInRequired(true);
        return;
      }

      const next = event.target.checked;
      setLiked(next);

      startTransition(async () => {
        try {
          const result = next
            ? await likeChapter(chapter.id)
            : await unlikeChapter(chapter.id);

          if (result.success) {
            enqueueSnackbar(dictionary[next ? 'liked!' : 'unliked'], {
              variant: 'info'
            });
          } else {
            setLiked(!next);
            enqueueSnackbar(result.error, { variant: 'error' });
          }
        } catch (_error) {
          setLiked(!next);
          enqueueSnackbar(dictionary['an error occurred'], {
            variant: 'error'
          });
        }
      });
    },
    [authenticated, chapter.id, setSignInRequired, dictionary]
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      enqueueSnackbar(dictionary['link copied'], { variant: 'info' });
    } catch (_error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    }
  }, [dictionary]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Tooltip
        title={liked ? dictionary['button unlike'] : dictionary['button like']}
      >
        <Checkbox
          icon={<FavoriteBorder />}
          checkedIcon={<Favorite />}
          checked={liked}
          disabled={isPending}
          onChange={handleLikeChange}
          slotProps={{
            input: {
              'aria-label': liked
                ? dictionary['button unlike']
                : dictionary['button like']
            }
          }}
        />
      </Tooltip>

      <Tooltip title={dictionary['copy link']}>
        <IconButton
          onClick={handleCopyLink}
          aria-label={dictionary['copy link']}
        >
          <Link />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default memo(ChapterActions);

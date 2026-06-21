'use client';

import { Delete } from '@mui/icons-material';
import {
  Avatar,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useState, useTransition } from 'react';
import type { AppMap, Coauthor } from '../../../types';
import { removeCoauthor } from '../../actions/coauthors';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  open: boolean;
  onClose: () => void;
  map: AppMap | null;
  coauthors: Coauthor[];
};

function CoauthorsDialog({ open, onClose, map, coauthors }: Props) {
  const dictionary = useDictionary();
  const router = useRouter();

  const [removingId, setRemovingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRemove = useCallback(
    (coauthor: Coauthor) => {
      if (!map) {
        return;
      }

      setRemovingId(coauthor.id);

      startTransition(async () => {
        const result = await removeCoauthor(map.id, coauthor.id);

        if (result.success) {
          enqueueSnackbar(dictionary['remove coauthor success'], {
            variant: 'success'
          });
          router.refresh();
        } else {
          enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
            variant: 'error'
          });
        }

        setRemovingId(null);
      });
    },
    [map, dictionary, router]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{dictionary.coauthors}</DialogTitle>
      <DialogContent>
        <List>
          {coauthors.map((coauthor) => (
            <ListItem
              key={coauthor.id}
              secondaryAction={
                coauthor.author ? (
                  <Chip label={dictionary.owner} size="small" />
                ) : (
                  <IconButton
                    edge="end"
                    aria-label={dictionary['remove coauthor']}
                    title={dictionary['remove coauthor']}
                    disabled={isPending && removingId === coauthor.id}
                    onClick={() => handleRemove(coauthor)}
                  >
                    <Delete color="error" />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                <Avatar src={coauthor.image?.avatar} alt={coauthor.name} />
              </ListItemAvatar>
              <ListItemText primary={coauthor.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default memo(CoauthorsDialog);

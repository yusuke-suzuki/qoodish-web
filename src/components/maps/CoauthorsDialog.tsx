'use client';

import { Delete } from '@mui/icons-material';
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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

  const [confirmTarget, setConfirmTarget] = useState<Coauthor | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = useCallback(() => {
    if (!map || !confirmTarget) {
      return;
    }

    startTransition(async () => {
      const result = await removeCoauthor(map.id, confirmTarget.id);

      if (result.success) {
        enqueueSnackbar(dictionary['remove coauthor success'], {
          variant: 'success'
        });
        setConfirmTarget(null);
        router.refresh();
      } else {
        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });
      }
    });
  }, [map, confirmTarget, dictionary, router]);

  return (
    <>
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
                      onClick={() => setConfirmTarget(coauthor)}
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

      <Dialog
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        fullWidth
      >
        <DialogTitle>{dictionary['sure to remove coauthor']}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dictionary['remove coauthor detail']}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmTarget(null)}
            color="inherit"
            disabled={isPending}
          >
            {dictionary.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="error"
            loading={isPending}
          >
            {dictionary['remove coauthor']}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default memo(CoauthorsDialog);

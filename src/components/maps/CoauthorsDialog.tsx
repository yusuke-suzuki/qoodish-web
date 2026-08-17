'use client';

import { Delete } from '@mui/icons-material';
import {
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useState } from 'react';
import type { AppMap, Coauthor } from '../../../types';
import { removeCoauthor } from '../../actions/coauthors';
import useDictionary from '../../hooks/useDictionary';
import AppDialog from '../common/AppDialog';
import ConfirmDialog from '../common/ConfirmDialog';

type Props = {
  open: boolean;
  onClose: () => void;
  map: AppMap | null;
  coauthors: Coauthor[];
};

function CoauthorsDialog({ open, onClose, map, coauthors }: Props) {
  const dictionary = useDictionary();
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();

  const [confirmTarget, setConfirmTarget] = useState<Coauthor | null>(null);

  const handleConfirm = useCallback(async () => {
    if (!map || !confirmTarget) {
      return;
    }

    const result = await removeCoauthor(map.id, confirmTarget.id);

    if (result.success) {
      enqueueSnackbar(dictionary['remove coauthor success'], {
        variant: 'success'
      });
      setConfirmTarget(null);
      router.refresh();
      return;
    }

    enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
      variant: 'error'
    });
  }, [map, confirmTarget, dictionary, router]);

  return (
    <>
      <AppDialog
        open={open}
        onClose={onClose}
        title={dictionary.coauthors}
        disableContentPadding
        dividers
        cancelLabel={dictionary.close}
      >
        <List disablePadding>
          {coauthors.map((coauthor) => (
            <ListItem
              key={coauthor.id}
              disablePadding
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
              <ListItemButton
                component={Link}
                href={`/${lang}/users/${coauthor.id}`}
                onClick={onClose}
              >
                <ListItemAvatar>
                  <Avatar src={coauthor.image?.avatar} alt={coauthor.name} />
                </ListItemAvatar>
                <ListItemText primary={coauthor.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </AppDialog>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title={dictionary['sure to remove coauthor']}
        description={dictionary['remove coauthor detail']}
        confirmLabel={dictionary['remove coauthor']}
        confirmColor="error"
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default memo(CoauthorsDialog);

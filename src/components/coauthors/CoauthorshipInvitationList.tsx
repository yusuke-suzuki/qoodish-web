'use client';

import { MailOutline } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useState, useTransition } from 'react';
import type { CoauthorshipInvitation } from '../../../types';
import {
  acceptCoauthorshipInvitation,
  declineCoauthorshipInvitation
} from '../../actions/coauthors';
import useDictionary from '../../hooks/useDictionary';
import NoContents from '../common/NoContents';

type Props = {
  invitations: CoauthorshipInvitation[];
};

function CoauthorshipInvitationList({ invitations }: Props) {
  const dictionary = useDictionary();
  const router = useRouter();

  const [actingId, setActingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAccept = useCallback(
    (invitation: CoauthorshipInvitation) => {
      setActingId(invitation.id);

      startTransition(async () => {
        const result = await acceptCoauthorshipInvitation(invitation.id);

        if (result.success) {
          enqueueSnackbar(dictionary['accept invitation success'], {
            variant: 'success'
          });
          router.refresh();
        } else {
          enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
            variant: 'error'
          });
        }

        setActingId(null);
      });
    },
    [dictionary, router]
  );

  const handleDecline = useCallback(
    (invitation: CoauthorshipInvitation) => {
      setActingId(invitation.id);

      startTransition(async () => {
        const result = await declineCoauthorshipInvitation(invitation.id);

        if (result.success) {
          enqueueSnackbar(dictionary['decline invitation success'], {
            variant: 'success'
          });
          router.refresh();
        } else {
          enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
            variant: 'error'
          });
        }

        setActingId(null);
      });
    },
    [dictionary, router]
  );

  if (invitations.length < 1) {
    return (
      <NoContents icon={MailOutline} message={dictionary['no invites here']} />
    );
  }

  return (
    <List>
      {invitations.map((invitation) => (
        <ListItem
          key={invitation.id}
          alignItems="flex-start"
          secondaryAction={
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                color="inherit"
                disabled={isPending && actingId === invitation.id}
                onClick={() => handleDecline(invitation)}
              >
                {dictionary.decline}
              </Button>
              <Button
                size="small"
                variant="contained"
                color="secondary"
                loading={isPending && actingId === invitation.id}
                onClick={() => handleAccept(invitation)}
              >
                {dictionary.accept}
              </Button>
            </Stack>
          }
        >
          <ListItemAvatar>
            <Avatar
              variant="rounded"
              src={invitation.map.image?.avatar}
              alt={invitation.map.name}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="subtitle1" fontWeight={600}>
                {invitation.map.name}
              </Typography>
            }
            secondary={
              <Box component="span">
                <strong>{invitation.inviter.name}</strong>
                {` ${dictionary['coauthor invitation message']}`}
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}

export default memo(CoauthorshipInvitationList);

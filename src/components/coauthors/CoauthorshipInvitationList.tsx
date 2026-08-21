'use client';

import { MailOutline } from '@mui/icons-material';
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardHeader,
  Stack
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
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

  const handleAccept = (invitation: CoauthorshipInvitation) => {
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
  };

  const handleDecline = (invitation: CoauthorshipInvitation) => {
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
  };

  if (invitations.length < 1) {
    return (
      <NoContents icon={MailOutline} message={dictionary['no invites here']} />
    );
  }

  return (
    <Stack spacing={2}>
      {invitations.map((invitation) => {
        const acting = isPending && actingId === invitation.id;

        return (
          <Card key={invitation.id} variant="outlined">
            <CardHeader
              avatar={
                <Avatar
                  variant="rounded"
                  src={invitation.map.image?.avatar}
                  alt={invitation.map.name}
                />
              }
              title={invitation.map.name}
              titleTypographyProps={{ fontWeight: 600 }}
              subheader={`${invitation.inviter.name} ${dictionary['coauthor invitation message']}`}
            />
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              <Button
                color="inherit"
                disabled={acting}
                onClick={() => handleDecline(invitation)}
              >
                {dictionary.decline}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                loading={acting}
                onClick={() => handleAccept(invitation)}
              >
                {dictionary.accept}
              </Button>
            </CardActions>
          </Card>
        );
      })}
    </Stack>
  );
}

export default memo(CoauthorshipInvitationList);

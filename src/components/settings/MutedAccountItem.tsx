'use client';

import {
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Link as MuiLink
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { MutedAccount } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import useMute from '../../hooks/useMute.ts';
import AuthorAvatar from '../common/AuthorAvatar.tsx';

type Props = {
  account: MutedAccount;
  onUnmuted: (userId: number) => void;
};

function MutedAccountItem({ account, onUnmuted }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const { pending, unmute } = useMute();

  const handleClick = async () => {
    const unmuted = await unmute(account.id);

    if (!unmuted) {
      return;
    }

    onUnmuted(account.id);
  };

  return (
    <ListItem
      disableGutters
      secondaryAction={
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          loading={pending}
          onClick={handleClick}
        >
          {dictionary.unmute}
        </Button>
      }
    >
      <ListItemAvatar>
        <AuthorAvatar author={account} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <MuiLink
            underline="hover"
            color="inherit"
            component={Link}
            href={localePath(`/users/${account.id}`)}
          >
            {account.name}
          </MuiLink>
        }
        slotProps={{ primary: { noWrap: true } }}
      />
    </ListItem>
  );
}

export default memo(MutedAccountItem);
